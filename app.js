Vue.use(Buefy.default)

class Song {
  constructor(hash, cds) {
    this.name         = hash[':name']
    this.url          = hash[':url']
    this.singers_text = hash[':singers'].join('、');

    var share_text = `
【${this.name}】(${this.singers_text})
${this.url}
    `.trim();
    this.imastodon_share = encodeURI('https://imastodon.net/share?text=' + share_text);
    this.twitter_share   = encodeURI('https://twitter.com/share?text='   + share_text);

    this.cd = cds.find(function (cd) {
      return cd.name_short == hash[':album_short'];
    });
  }
}

class CD {
  constructor(hash) {
    this.name         = hash[':name'];
    this.name_short   = hash[':name_short'];
    this.series_short = hash[':series_short'];
  }
}

var app = new Vue({
  el: '#app',
  data: {
    keyword: '',
    original_songs: undefined,
    songs: undefined,
    enabled_search_items: ["song_name", "idol_unit", "cd", "cd_short"]
  },
  mounted: function () {
    var cds = this.get_cds();
    var songs = this.get_songs(cds);
    this.original_songs = songs;
    this.songs = songs;
  },
  computed: {
    keywords: function () {
      return this.keyword.toLowerCase().replace(/[\s　]+/gi, ' ').trim().split(' ');
    }
  },
  methods: {
    get_songs: function (cds) {
      var songs = YAML.load('https://bitbucket.org/gomao9/utada_data/raw/83cc065fc2ae402c0375181a47df4e97c95039b6/million.yml').concat(
        YAML.load('https://bitbucket.org/gomao9/utada_data/raw/83cc065fc2ae402c0375181a47df4e97c95039b6/cinderella.yml'));
      return songs.map(function(song) {
        return new Song(song, cds);
      });
    },
    get_cds: function () {
      var cds = YAML.load('https://bitbucket.org/gomao9/utada_data/raw/83cc065fc2ae402c0375181a47df4e97c95039b6/albums.yml')
      return cds.map(function (cd) {
        return new CD(cd);
      });
    },
    update_filter: function() {
      this.songs = this.original_songs.filter(function(song) {
        var target_pairs = [ ["song_name", song.name.toLowerCase()],
                             ["idol_unit", song.singers_text],
                             ["cd", song.cd.name.toLowerCase()],
                             ["cd", song.cd.name_short.toLowerCase()]]
        var targets = target_pairs.filter(function (pair) {
          return app.enabled_search_items.includes(pair[0])
        }).map(function(pair) { return pair[1] });

        return app.keywords.every(function (word) {
          return targets.some(function (target) {
            return target.includes(word || '');
          });
        });
      });
    }
  },
  watch: {
    keyword: function () {
      this.update_filter();
    },
    enabled_search_items: function () {
      this.update_filter();
    }
  },
  directives: {
    focus: {
      inserted: function (el) {
        el.focus()
      }
    }
  }
});
