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
  const symbol = text.trim().toLowerCase();

  try {
    const response = await axios.get('https://api.coingecko.com/api/v3/coins/markets', {
      params: {
        vs_currency: 'usd',
        ids: symbol,
      },
    });

    const data = response.data[0];

    if (data) {
      const price = data['current_price'];
      const marketCap = data['market_cap'];
      const volume = data['total_volume'];
      const change = data['price_change_percentage_24h'];
      const lastUpdated = new Date(data['last_updated']);

      const message = {
        response_type: 'in_channel',
        text: `*${symbol.toUpperCase()}*`,
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

      await axios.post(response_url, message);
      res.status(200).json({ text: 'Request processed.' });
    } else {
      res.status(200).json({ text: `Sorry, I couldn't find any information for ${symbol.toUpperCase()}.` });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ text: 'An error occurred while fetching the data. Please try again later.' });
  }
});

export default handler;