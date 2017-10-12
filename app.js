Vue.use(Buefy.default)
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
        song.name         = song[':name']
        song.url          = song[':url']
        song.album        = song[':album_short']
        song.singers_text = song[':singers'].join('、');

        var current_page = window.location.href;
        var share_text = `
【${song.name}】(${song.singers_text})
${song.url}
(${current_page} から)
        `.trim();
        song.imastodon_share = encodeURI('https://imastodon.net/share?text=' + share_text);
        song.twitter_share   = encodeURI('https://twitter.com/share?text='   + share_text);

        return song;
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
