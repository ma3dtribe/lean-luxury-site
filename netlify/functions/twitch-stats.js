exports.handler = async function () {
  const SUPABASE_URL = "https://tgqfplueqjhsywkcjaal.supabase.co";
  const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY;

  try {
    const response = await fetch("https://decapi.me/twitch/viewercount/ma3dtribe");
    const text = await response.text();
    const viewers = parseInt(text, 10) || 0;

    await fetch(`${SUPABASE_URL}/rest/v1/twitch_stats`, {
      method: "POST",
      headers: {
        "apikey": SUPABASE_KEY,
        "Authorization": `Bearer ${SUPABASE_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        viewers: viewers
      })
    });

    return {
      statusCode: 200,
      body: JSON.stringify({
        success: true,
        viewers: viewers
      })
    };
  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({
        success: false,
        error: error.message
      })
    };
  }
};;
