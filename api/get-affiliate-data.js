// api/get-affiliate-data.js
export default async function handler(req, res) {
  const { affiliate_id } = req.query;

  if (!affiliate_id) {
    return res.status(400).json({ error: 'Missing affiliate ID' });
  }

  const HUBSPOT_API_KEY = process.env.HUBSPOT_API_KEY;

  try {
    const hubspotRes = await fetch(`https://api.hubapi.com/crm/v3/objects/contacts/search`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${HUBSPOT_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        filterGroups: [{
          filters: [{
            propertyName: "affiliate_id",
            operator: "EQ",
            value: affiliate_id
          }]
        }],
        properties: [
          "aff_preferred_countries",
          "aff_preferred_verticals",
          "traffic_sources"
        ],
        limit: 1
      })
    });

    const json = await hubspotRes.json();
    const contact = json.results?.[0];

    if (!contact) {
      return res.status(404).json({ error: 'Affiliate not found' });
    }

    return res.status(200).json({
      country: contact.properties.affiliate_preferred_country,
      category: contact.properties.affiliate_preferred_category,
      channel: contact.properties.affiliate_preferred_channel
    });

  } catch (error) {
    console.error('HubSpot API error:', error);
    return res.status(500).json({ error: 'HubSpot request failed' });
  }
}
