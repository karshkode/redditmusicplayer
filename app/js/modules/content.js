var ProgressBarModel = require("./progressbar");


function ContentModel() {
	/// Controls the Content.

	/// Content->Events
	// :: playlist-select ("radio|music", element, song) : Playlist item is selected.
	// :: playlist-more ("radio|music") : More requested.

	/// Listeners->Content
	// :: build ("radio|music", playlist[], song) : Builds Playlists.
	// :: music-progress ("radio|music") : Update the bottom progressbar.

	var self = this;

	var musicProgress = new ProgressBarModel(".music-progress");

	// MUSIC
	var buildMusicView = function(songs, currentSong) {
		var root = $(".music.content .playlist");
		var template = $(".templates [type='html/musicplaylist']").html();

		var add = function(item) {
			if (item.origin == "youtube.com") item.origin = "<i class='icon youtube play'></i>";
			var newEl = $($.render(template, item));
			var el = newEl.appendTo(root);
			if (currentSong) {// New Playlist Received > Send Songs & Current Song > Rebuild View
				if (item.title == currentSong.title) {
					el.addClass("active");
				}
			}
			//el.transition("fade down in");
			el.click(function() {
				self.trigger("playlist-select", el, item);
			})
		}

		var more = function() {
			var newEl = $("<div class='item more'></div>");
			newEl.append($("<div class='name'>Load More</div>"));
			var el = newEl.appendTo(root);
			//el.transition("fade down in"); 
			el.click(function() {
				self.trigger("playlist-more");
			})
		}

		
		// Remove all old songs...
		$(".music.content .playlist .item").remove()
		// .transition({
		// 	animation: "fade up out",
		// 	duration: "100ms",
		// 	complete: function() {
		// 		$(this).remove();
		// 	}
		// });

		// For all the new songs...
		for (var i = 0; i < songs.length; i++) {
			add(songs[i]);
		};
		more();
	}

	var musicSongSelect = function(song) {
		var items = $(".music.content .playlist .item");
		items.siblings(".active").removeClass("active");
		items.siblings('[href="'+song.file+'"]').addClass("active");
	}

	$.observable(self);

	self.on("build", function(view, content, currentSong) {
		if (view == "music playlist") {
			buildMusicView(content, currentSong);
		}
	})

	var intervalProgressBar;
	function updateProgressBar(updateFunction) {
		if (!intervalProgressBar) {
			musicProgress.start();
			intervalProgressBar = window.setInterval(function() {
				var percentage = updateFunction();
				musicProgress.set(percentage);
			}, 500);
		}
	}


	self.on("music-progress", function(currentSong, data) {
		if (currentSong.origin == "soundcloud.com") {
			try {
				musicProgress.set(data.relativePosition*100);
			} catch(err) {
				//console.error(currentSong);
			}
		} else {
			updateProgressBar(function() {
				var data = $("#youtube").tubeplayer("data");
				return data.currentTime / data.duration * 100;
			})
		}
	})

	self.on("new-song", function(currentSong) {
		musicSongSelect(currentSong);
	})
}

module.exports = ContentModel;