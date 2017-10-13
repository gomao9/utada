Vue.use(Buefy.default)

class Song {
  constructor(hash) {
    this.name         = hash[':name']
    this.url          = hash[':url']
    this.album        = hash[':album_short']
    this.singers_text = hash[':singers'].join('、');

    var share_text = `
【${this.name}】(${this.singers_text})
${this.url}
    `.trim();
    this.imastodon_share = encodeURI('https://imastodon.net/share?text=' + share_text);
    this.twitter_share   = encodeURI('https://twitter.com/share?text='   + share_text);
  }
}

var app = new Vue({
  el: '#app',
  data: {
    keyword: '',
    original_songs: undefined,
    songs: undefined
  },
  mounted: function () {
    var songs = this.get_songs();
    this.original_songs = songs;
    this.songs = songs;
  },
  methods: {
    get_songs: function() {
      var songs = YAML.load('https://bitbucket.org/gomao9/utada_data/raw/83cc065fc2ae402c0375181a47df4e97c95039b6/million.yml').concat(
        YAML.load('https://bitbucket.org/gomao9/utada_data/raw/83cc065fc2ae402c0375181a47df4e97c95039b6/cinderella.yml'));
      return songs.map(function(song) {
        return new Song(song);
      });
    }
  },
  watch: {
    keyword: function (word) {
      this.songs = this.original_songs.filter(function(song) {
        return song.name.toLowerCase().includes(word.toLowerCase() || '') ||
               song.singers_text.includes(word || '');
      });
    }
  }
});
