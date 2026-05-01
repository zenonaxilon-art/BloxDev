import express from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.VITE_SUPABASE_URL || '';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

const supabaseAdmin = (supabaseUrl && supabaseServiceKey) 
  ? createClient(supabaseUrl, supabaseServiceKey)
  : null;

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // API Routes
  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok' });
  });

  // Example Roblox OAuth endpoints
  app.get('/api/auth/url', (req, res) => {
    const clientId = process.env.ROBLOX_CLIENT_ID;
    const appUrl = process.env.APP_URL || `http://localhost:${PORT}`;
    const redirectUri = `${appUrl}/auth/callback`;

    if (!clientId) {
      return res.status(500).json({ error: 'ROBLOX_CLIENT_ID not configured' });
    }

    const params = new URLSearchParams({
      client_id: clientId,
      redirect_uri: redirectUri,
      response_type: 'code',
      scope: 'openid profile', // Roblox minimal scopes needed
      step: 'challenge',
    });

    const authUrl = `https://apis.roblox.com/oauth/v1/authorize?${params.toString()}`;
    res.json({ url: authUrl });
  });

  app.get(['/auth/callback', '/auth/callback/'], async (req, res) => {
    const { code } = req.query;
    const clientId = process.env.ROBLOX_CLIENT_ID;
    const clientSecret = process.env.ROBLOX_CLIENT_SECRET;
    const appUrl = process.env.APP_URL || `http://localhost:${PORT}`;
    const redirectUri = `${appUrl}/auth/callback`;

    if (!clientId || !clientSecret || !supabaseAdmin) {
      return res.send(`Missing configuration for Roblox Auth or Supabase Admin.`);
    }

    try {
      // Exchange code for token
      const tokenRes = await fetch('https://apis.roblox.com/oauth/v1/token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          client_id: clientId,
          client_secret: clientSecret,
          grant_type: 'authorization_code',
          code: code as string,
          redirect_uri: redirectUri
        })
      });

      const tokenData = await tokenRes.json();
      if (!tokenData.access_token) {
        throw new Error('Failed to get access token');
      }

      // Get user info
      const userInfoRes = await fetch('https://apis.roblox.com/oauth/v1/userinfo', {
        headers: {
          'Authorization': `Bearer ${tokenData.access_token}`
        }
      });
      const userInfo = await userInfoRes.json();
      const robloxId = userInfo.sub;
      const username = userInfo.preferred_username || `user_${robloxId}`;
      const avatar = userInfo.picture || '';

      // Check if user exists in Supabase
      const { data: existingUser } = await supabaseAdmin.from('users').select('*').eq('roblox_id', robloxId).single();
      
      let finalAuthEmail = `${robloxId}@roblox.bloxdev.local`;
      let finalAuthPassword = robloxId + clientSecret;

      if (!existingUser) {
        // Create dummy auth user to bridge Roblox OAuth to Supabase Auth
        const { data: authUser, error: authErr } = await supabaseAdmin.auth.admin.createUser({
          email: finalAuthEmail,
          password: finalAuthPassword,
          email_confirm: true,
        });

        if (authErr && !authErr.message.includes('already exists')) {
          throw authErr;
        }

        const { data: authUserGet } = await supabaseAdmin.auth.admin.listUsers();
        const finalAuthUser = authUser?.user || authUserGet.users.find((u: any) => u.email === finalAuthEmail);

        if (!finalAuthUser) throw new Error("Could not create/find auth user");

        // Insert into public.users
        const { error: insertErr } = await supabaseAdmin.from('users').insert({
          id: finalAuthUser.id,
          roblox_id: robloxId,
          username: username,
          avatar: avatar,
          verified: false,
          role: 'buyer'
        });
        
        if (insertErr) throw insertErr;
      }
      
      // Send signal back to frontend to sign in
      res.send(`
        <html>
          <body>
            <script>
              if (window.opener) {
                window.opener.postMessage({ 
                  type: 'OAUTH_AUTH_SUCCESS', 
                  credentials: {
                    email: '${finalAuthEmail}',
                    password: '${finalAuthPassword}'
                  }
                }, '*');
                window.close();
              } else {
                window.location.href = '/';
              }
            </script>
            <p>Authentication successful. This window should close automatically.</p>
          </body>
        </html>
      `);
    } catch (err: any) {
      console.error(err);
      res.send(`Auth Error: ${err.message}`);
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    // Production static files
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
