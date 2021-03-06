Vue.use(Buefy.default)

class Song {
  constructor(hash, cds, units) {
    this.name         = hash[':name']
    this.url          = hash[':url']
    this.singers      = hash[':singers']
    this.set_unit(units);
    this.set_singers_text();

    var singers = this.singers_text ? `(${this.singers_text})` : ''
    this.share_text = `
【${this.name}】${singers}
${this.url}
    `.trim();
    this.set_share_text('');

    this.cd = cds.find(function (cd) {
      return cd.name_short == hash[':album_short'];
    });
  }

  set_share_text(suffix) {
    this.imastodon_share = 'https://imastodon.net/share?text=' + encodeURIComponent(this.share_text + suffix);
    this.twitter_share   = 'https://twitter.com/share?text='   + encodeURIComponent(this.share_text + suffix);
  }

  set_unit(units) {
    var index = this.singers.findIndex(function (singer) {
      return units.some(function (unit) { return unit.name == singer });
    });
    if(index >= 0) {
      this.unit = this.singers.splice(index, 1)[0];
    }
  }

  set_singers_text() {
    if (this.singers.length <= 0 && !this.unit) {
      this.singers_text = '';
    } else if (this.singers.length <= 0) {
      this.singers_text = `${this.unit}`
    } else if (!this.unit) {
      this.singers_text = `${this.singers.join('、')}`
    } else {
      this.singers_text = `${this.unit}[${this.singers.join('、')}]`;
    }
  }
}

class CD {
  constructor(hash) {
    this.name         = hash[':name'];
    this.name_short   = hash[':name_short'];
    this.series_short = hash[':series_short'];
  }
}

class Unit {
  constructor(hash) {
    this.name         = hash[':name'];
  }
}

var app = new Vue({
  el: '#app',
  data: {
    keyword: '',
    original_songs: undefined,
    songs: undefined,
    enabled_search_items: ["song_name", "idol_unit", "cd", "cd_short"],
    enable_hashtag: false
  },
  mounted: function () {
    var units = this.get_units();
    var cds = this.get_cds();
    var songs = this.get_songs(cds, units);
    this.original_songs = songs;
    this.songs = songs;
  },
  computed: {
    keywords: function () {
      return this.keyword.toLowerCase().replace(/[\s　]+/gi, ' ').trim().split(' ');
    },
    hashtag_label: function () {
      return this.enable_hashtag ? '#imas_djをつける' : '#imas_djをつけない'
    }
  },
  methods: {
    get_songs: function (cds, units) {
      var songs = YAML.load('data/million.yml').concat(
        YAML.load('data/cinderella.yml'));
      return songs.map(function(song) {
        return new Song(song, cds, units);
      });
    },
    get_cds: function () {
      var cds = YAML.load('data/albums.yml')
      return cds.map(function (cd) {
        return new CD(cd);
      });
    },
    get_units: function () {
      var units = YAML.load('data/idols.yml');
      return units.map(function (unit) {
        if (unit[':unit']) {
          return new Unit(unit);
        }
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
    },
    enable_hashtag: function (enabled) {
      this.songs.forEach(function(song) { song.set_share_text(enabled ? ' #imas_dj' : '') })
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
