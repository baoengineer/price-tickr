import { NextApiRequest, NextApiResponse } from 'next';
import nextConnect from 'next-connect';
import { WebClient } from '@slack/web-api';
import axios from 'axios';

const SLACK_BOT_TOKEN = process.env.SLACK_BOT_TOKEN;

const cryptoSymbolMap: Record<any, string> = {
  btc: 'bitcoin',
  eth: 'ethereum',
  ltc: 'litecoin',
  flm: 'flamingo-finance',
  arb: 'arbitrum',
  op: 'optimism',
  canto: 'canto',
  mute: 'mute',
  bnb: 'binancecoin',
  ada: 'cardano',
  usdt: 'tether',
  xrp: 'ripple',
  doge: 'dogecoin',
  dot: 'polkadot',
  sol: 'solana',
  uni: 'uniswap',
  link: 'chainlink',
  bch: 'bitcoin-cash',
  luna: 'terra',
  matic: 'polygon',
  xlm: 'stellar',
  etc: 'ethereum-classic',
  vet: 'vechain',
  fil: 'filecoin',
  trx: 'tron',
  avax: 'avalanche-2',
  xmr: 'monero',
  eos: 'eos',
  aave: 'aave',
  gno: 'gnosis',
  algo: 'algorand',
  atom: 'cosmos',
  ksm: 'kusama',
  ceth: 'compound-ether',
  miota: 'iota',
  neo: 'neo',
  theta: 'theta-token',
  ccomp: 'compound-governance-token',
  mkranalysis: 'maker',
  tfuel: 'theta-fuel',
  lpt: 'livepeer',
  sushi: 'sushi',
  yfi: 'yearn-finance',
  snx: 'synthetix-network-token',
  zec: 'zcash',
  uma: 'uma',
  qtum: 'qtum',
  ont: 'ontology',
  zil: 'zilliqa',
  crv: 'curve-dao-token',
  rvn: 'ravencoin',
  icx: 'icon',
  axs: 'axie-infinity',
  mana: 'decentraland',
  bat: 'basic-attention-token',
  enj: 'enjincoin',
  ren: 'republic-protocol',
  lrc: 'loopring',
  knc: 'kyber-network',
  bal: 'balancer',
  rep: 'augur',
  stk: 'stk',
  gnt: 'golem',
  mln: 'melon',
  num: 'numeraire',
  nmr: 'numeraire',
  chz: 'chiliz',
  paxg: 'pax-gold',
  bancor: 'bancor',
  comp: 'compound-governance-token',
  mkr: 'maker',
  omg: 'omg',
  dai: 'dai',
  zrx: '0x',
  yfii: 'yfii-finance',
  grt: 'the-graph',
  cel: 'celsius-degree-token',
  umc: 'uni-marketing-coin',
  rune: 'thorchain',
  ocean: 'ocean-protocol',
  egld: 'elrond-erd-2',
  ctsi: 'cartesi',
  super: 'superfarm',
  xem: 'nem',
  pnt: 'pnetwork',
  ant: 'aragon',
  dnt: 'district0x',
  ankr: 'ankr',
  coti: 'coti',
  ckb: 'nervos-network',
  storj: 'storj',
  edg: 'edgeless',
  wnxm: 'wrapped-nxm',
  dent: 'dent',
  bnt: 'bancor',
  ftt: 'ftx-token',
  hnt: 'helium',
  rsr: 'reserve-rights-token',
  bsv: 'bitcoin-sv',
  yusd: 'yusd',
  ust: 'usd-terra',
  pax: 'paxos-standard',
  busd: 'binance-usd',
  hbar: 'hedera-hashgraph',
  stx: 'stox',
  kava: 'kava',
  aion: 'aion',
  meta: 'metadium',
  mco: 'crypto-com',
  ignis: 'ignis',
  srn: 'sirin-labs-token',
  vgx: 'voyager-token',
  qnt: 'quant-network',
  iost: 'iostoken',
  dcr: 'decred',
  zilliqa: 'zilliqa',
  ftm: 'fantom',
  xtz: 'tezos',
  btg: 'bitcoin-gold',
  zen: 'zencash',
  waves: 'waves',
  dgb: 'digibyte',
  audio: 'audius',
  rev: 'revain',
  cvc: 'civic',
  bel: 'bella-protocol',
  glm: 'golem',
  akro: 'akropolis',
  sxp: 'swipe',
  alpha: 'alpha-finance',
  front: 'frontier-token',
  rose: 'oasis-network',
  ava: 'travala',
  xvg: 'verge',
  nano: 'nano',
  wazirx: 'wazirx',
  stmx: 'storm',
  dodo: 'dodo',
  reef: 'reef-finance',
  celer: 'celer-network',
  superbid: 'superbid',
  prom: 'prometeus',
  hoge: 'hoge-finance',
  btt: 'bittorrent-2',
  hot: 'holotoken',
  flow: 'flow',
  chsb: 'swissborg',
  hxro: 'hxro',
  nkn: 'nkn',
  wings: 'wings',
  dt: 'deltatoken',
  gbyte: 'byteball',
  lsk: 'lisk',
  sc: 'siacoin',
  steem: 'steem',
  snt: 'status',
  strat: 'stratis',
  bcd: 'bitcoin-diamond',
  komodo: 'komodo',
  ardr: 'ardor',
  ar: 'arweave',
  cfx: 'conflux-token',
  iotx: 'iotex',
  orbs: 'orbs',
  vite: 'vite',
  wan: 'wanchain',
  wtc: 'waltonchain',
  xhv: 'haven-protocol',
  yoyow: 'yoyow',
  zano: 'zano',
  zcn: '0chain',
  znn: 'zenon',
  zxc: '0xcert',
};

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
  const symbol = cryptoSymbolMap[text.trim().toLowerCase()] || text;

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
      res.status(200).json({ text: 'Surprise 🫣' });
    } else {
      res.status(200).json({ text: `Sorry, I couldn't find any information for ${symbol.toUpperCase()}.` });
    }
  }  catch (error) {
    res.status(500).json({ text: 'An error occurred while fetching the data. Please try again later.' });
  }
  
});

export default handler;