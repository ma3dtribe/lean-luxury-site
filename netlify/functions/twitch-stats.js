exports.handler = async function () {
  const SUPABASE_URL = "https://tgqfplueqjhsywkcjaal.supabase.co";
  const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY;

  try {
    const response = await fetch("https://decapi.me/twitch/viewercount/ma3dtribe");
    const text = await response.text();
    const viewers = parseInt(text, 10) || 0;

    const saveResponse = await fetch(`${SUPABASE_URL}/rest/v1/twitch_stats`, {
      method: "POST",
      headers: {
        "apikey": SUPABASE_KEY,
        "Authorization": `Bearer ${SUPABASE_KEY}`,
        "Content-Type": "application/json",
        "Prefer": "return=representation"
      },
      body: JSON.stringify({
  viewers: viewers
})
});
    const saveText = await saveResponse.text();

    if (!saveResponse.ok) {
      return {
        statusCode: 500,
        body: JSON.stringify({
          success: false,
          viewers,
          saveStatus: saveResponse.status,
          saveError: saveText
        })
      };
    }

    return {
      statusCode: 200,
      body: JSON.stringify({
        success: true,
        viewers,
        saved: saveText
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
};
