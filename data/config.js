var config = {
  title: 'Tim\'s TDF 2016',
  start: '2016-07-02',
  end: '2016-07-24',
  baseUrl: 'http://www.letour.fr/useradgents/2016/json',
  photosUrl: 'http://www.letour.fr/useradgents/2016/photos',
  alternativePhotosUrl: 'http://www.letour.fr/PHOTOS/TDF/2016',
  dayEndsAt: 18, // shows afterstage screen.
  debugStage: false, // needs to be a string if used.
  useLiveNewsInsteadOfTwitter: false,
  twitter: {
    consumer_key: process.env.consumer_key,
    consumer_secret: process.env.consumer_secret,
    access_token_key: process.env.access_token_key,
    access_token_secret: process.env.access_token_secret
  }
}

module.exports = config;