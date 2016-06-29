var config = {
  title: 'Tim\'s TDF 2016',
  start: '2016-07-02',
  end: '2016-07-24',
  showBefore: true,
  dayEndsAt: 18, // shows afterstage screen at hour.
  debugStage: false, // needs to be a string if used e.g: '1100' 
  twitterAccountToFollow: 153403071, // @letour or 7461682 for @steephil, 3302563433 for @letourdata
  useLiveNewsInsteadOfTwitter: true,
  year: 2016,
  baseUrl: 'http://www.letour.fr/useradgents/$$year$$/json',
  photosUrl: 'http://www.letour.fr/useradgents/$$year$$/photos',
  alternativePhotosUrl: 'http://www.letour.fr/PHOTOS/TDF/$$year$$',
  twitter: {
    consumer_key: process.env.consumer_key,
    consumer_secret: process.env.consumer_secret,
    access_token_key: process.env.access_token_key,
    access_token_secret: process.env.access_token_secret
  }
}

module.exports = config;