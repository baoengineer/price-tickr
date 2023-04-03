import { NextApiRequest, NextApiResponse } from 'next';
import nextConnect from 'next-connect';
import { WebClient } from '@slack/web-api';
import axios from 'axios';

const SLACK_BOT_TOKEN = process.env.SLACK_BOT_TOKEN;

const web = new WebClient(SLACK_BOT_TOKEN);

interface SlackRequest extends NextApiRequest {
  body: {
    text: string;
    response_url: string;
  };
}

const handler = nextConnect<SlackRequest, NextApiResponse>();

handler.post(async (req, res) => {
  const { text, response_url } = req.body;
  const symbol = text.trim().toUpperCase();

  try {
    const response = await axios.get('https://api.coingecko.com/api/v3/simple/price', {
      params: {
        ids: symbol,
        vs_currencies: 'usd',
        include_market_cap: 'true',
        include_24hr_vol: 'true',
        include_24hr_change: 'true',
        include_last_updated_at: 'true',
      },
    });

    const data = response.data[symbol];

    if (data) {
      const price = data['usd'];
      const marketCap = data['usd_market_cap'];
      const volume = data['usd_24h_vol'];
      const change = data['usd_24h_change'];
      const lastUpdated = new Date(data['last_updated_at'] * 1000);

      const message = {
        response_type: 'in_channel',
        text: `*${symbol}*`,
        attachments: [
          {
            fields: [
              { title: 'Price', value: `$${price.toFixed(2)}`, short: true },
              { title: 'Market Cap', value: `$${marketCap.toFixed(2)}`, short: true },
              { title: '24h Volume', value: `$${volume.toFixed(2)}`, short: true },
              { title: '24h Change', value: `${change.toFixed(2)}%`, short: true },
              { title: 'Last Updated', value: lastUpdated.toLocaleString(), short: true },
            ],
          },
        ],
      };

      await web.chat.postMessage({
        channel: response_url,
        ...message,
      });

      res.status(200).json({ text: 'Request processed.' });
    } else {
      res.status(200).json({ text: `Sorry, I couldn't find any information for ${symbol}.` });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ text: 'An error occurred while fetching the data. Please try again later.' });
  }
});

export default handler;