exports.handler = async function () {
  const SUPABASE_URL = "https://tgqfplueqjhsywkcjaal.supabase.co";
  const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY;

  try {
    const urls = [
      "https://decapi.me/twitch/viewercount/ma3dtribe?redirect=false",
      "https://decapi.me/twitch/viewercount/ma3dtribe"
    ];

    let viewers = 0;
    let rawText = "";

    for (const url of urls) {
      const response = await fetch(url, { cache: "no-store" });
      const text = await response.text();
      rawText += ` ${text}`;

      const found = Number(String(text || "").replace(/[^\d]/g, "") || 0);
      if (found > 0) {
        viewers = found;
        break;
      }
    }

    const saveResponse = await fetch(`${SUPABASE_URL}/rest/v1/twitch_stats`, {
      method: "POST",
      headers: {
        apikey: SUPABASE_KEY,
        Authorization: `Bearer ${SUPABASE_KEY}`,
        "Content-Type": "application/json",
        Prefer: "return=representation"
      },
      body: JSON.stringify({ viewers })
    });

    const saveText = await saveResponse.text();

    if (!saveResponse.ok) {
      return {
        statusCode: 500,
        body: JSON.stringify({
          success: false,
          viewers,
          rawText,
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
        rawText,
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
