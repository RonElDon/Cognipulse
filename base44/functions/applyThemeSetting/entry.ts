import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

// This function is called by the Neuro agent to apply theme settings
// It returns a special payload that the frontend reads to apply theme changes
Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await req.json();
    const { darkMode, accentColor, gradient } = body;

    // We store theme preferences on the user profile so they persist
    const profiles = await base44.entities.UserProfile.filter({ created_by: user.email });
    
    const themeData = {};
    if (darkMode !== undefined) themeData.theme_dark_mode = darkMode;
    if (accentColor !== undefined) themeData.theme_accent_color = accentColor;
    if (gradient !== undefined) themeData.theme_gradient = gradient;

    if (profiles.length > 0) {
      await base44.entities.UserProfile.update(profiles[0].id, themeData);
    }

    return Response.json({ 
      success: true, 
      applied: themeData,
      message: 'Theme-Einstellung gespeichert!'
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});