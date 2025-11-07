const Record = require('../models/Record');

function parseList(q) {
  if (!q) return null;
  if (Array.isArray(q)) return q;
  return String(q).split(',').map(s => s.trim()).filter(Boolean);
}

function buildFilter(query) {
  const {
    q,
    endYear,
    topics,
    sector,
    region,
    pestle,
    source,
    country,
    city
  } = query;

  const filter = {};

  if (endYear) {
    const y = Number(endYear);
    if (!Number.isNaN(y)) {
      filter.end_year = { $ne: '', $lte: y };
    }
  }

  if (topics) {
    const list = parseList(topics);
    if (list && list.length) filter.topic = { $in: list };
  }

  if (sector) {
    if (!(String(sector).toLowerCase() === 'all' || String(sector).trim() === '')) {
      filter.sector = sector;
    }
  }

  if (region) filter.region = region;
  if (pestle) filter.pestle = pestle;
  if (source) filter.source = source;
  if (country) filter.country = country;
  if (city) filter.city = city;

  if (q && String(q).trim() !== '') {
    const s = String(q).trim();
    const escaped = s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const regex = new RegExp(escaped, 'i');

    if (s.includes(',')) {
      const list = parseList(s);
      if (list && list.length) {
        filter.$or = [
          { topic: { $in: list } },
          { title: { $regex: regex } },
          { country: { $regex: regex } }
        ];
      } else {
        filter.title = { $regex: regex };
      }
    } else {
      filter.$or = [
        { title: { $regex: regex } },
        { topic: s },
        { country: { $regex: regex } }
      ];
    }
  }

  return filter;
}

async function getFilters(req, res) {
  try {
    const keys = ['topic', 'sector', 'region', 'country', 'pestle', 'source', 'end_year'];
    const out = {};
    for (const k of keys) {
      const vals = await Record.distinct(k);
      out[k] = vals
        .filter(v => v !== undefined && v !== null)
        .sort((a, b) => {
          const A = String(a).toLowerCase();
          const B = String(b).toLowerCase();
          if (A < B) return -1;
          if (A > B) return 1;
          return 0;
        });
    }
    return res.json(out);
  } catch (err) {
    console.error('getFilters error:', err);
    return res.status(500).json({ error: 'Server error' });
  }
}

async function getRecords(req, res) {
  try {
    const { limit = 1000, skip = 0 } = req.query;
    const filter = buildFilter(req.query);

    const records = await Record.find(filter)
      .skip(Number(skip))
      .limit(Number(limit))
      .lean();

    return res.json({ count: records.length, data: records });
  } catch (err) {
    console.error('getRecords error:', err);
    return res.status(500).json({ error: 'Server error' });
  }
}

async function getSummary(req, res) {
  try {
    const filter = buildFilter(req.query);
    const match = Object.keys(filter).length ? [{ $match: filter }] : [];

    const pipeline = [
      ...match,
      {
        $facet: {
          stats: [
            {
              $group: {
                _id: null,
                count: { $sum: 1 },
                avgIntensity: { $avg: '$intensity' },
                avgLikelihood: { $avg: '$likelihood' },
                avgRelevance: { $avg: '$relevance' }
              }
            }
          ],
          byTopic: [
            { $group: { _id: '$topic', count: { $sum: 1 } } },
            { $sort: { count: -1 } },
            { $limit: 20 }
          ],
          byRegion: [
            { $group: { _id: '$region', count: { $sum: 1 } } },
            { $sort: { count: -1 } },
            { $limit: 20 }
          ],
          topTopics: [
            { $group: { _id: '$topic', count: { $sum: 1 } } },
            { $sort: { count: -1 } },
            { $limit: 6 }
          ]
        }
      }
    ];

    const agg = await Record.aggregate(pipeline);
    const result = agg[0] || {};
    const stats = (result.stats && result.stats[0]) || { count: 0, avgIntensity: 0, avgLikelihood: 0, avgRelevance: 0 };

    return res.json({
      count: stats.count,
      avgIntensity: stats.avgIntensity || 0,
      avgLikelihood: stats.avgLikelihood || 0,
      avgRelevance: stats.avgRelevance || 0,
      byTopic: result.byTopic || [],
      byRegion: result.byRegion || [],
      topTopics: result.topTopics || []
    });
  } catch (err) {
    console.error('getSummary error:', err);
    return res.status(500).json({ error: 'Server error' });
  }
}

module.exports = {
  getFilters,
  getRecords,
  getSummary
};
