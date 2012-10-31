$(document).ready(function() {
	$('.subcommContainer').bind('subcommMessage', function(event, data) {		
		function entering(player) {
			var html = '<p>' + player + '</p>';
			player = player.toLowerCase();
			$('.subcommHistoryPanelPlayers').each(function(panelIndex, panel) {
				var done = false;
				$(this).children('p').each(function(index, element) { // attempt to insert before this <p>
					if (!done && player < $(this).html().toLowerCase()) {
						$(this).before(html);
						done = true;
					}
				});
				
				if (!done) { // append
					$(this).append(html);
				}
			});
		}
		
		function leaving(player) {
			$('.subcommHistoryPanelPlayers p').each(function(index, element) {
				if ($(this).html() === player)
					$(this).remove();
			});
		}
		
		var container = data.container;
		var message = data.message;
		var matches = message.match(/^(?:ENTERING|PLAYER):(.+?):.+?:.+?$/);
		if (matches) {
			leaving(matches[1]);
			return entering(matches[1]);
		}
		matches = message.match(/^LEAVING:(.+?)$/);
		if (matches) {
			return leaving(matches[1]);
		}
	});
	
	$('.subcommContainer').bind('subcommBannerMessage', function(event, data) {
		var container = data.container;
		var message = data.message;
		var action = 'entered';
		var matches = message.match(/^(?:ENTERING):(.+?):.+?:.+?$/);
		if (!matches) {
			action = 'left';
			matches = message.match(/^LEAVING:(.+?)$/);
			if (!matches) {
				return;
			}
		}
		
		var player = matches[1];
		var html = '<p><span style="color: blue;">' + player + '</span> has ' + action + ' the arena'
		$('.subcommBanner').each(function(index, element) {
			$(this).html(html);
		});
		
		event.stopImmediatePropagation();
	});
	
	$('.subcommContainer').bind('subcommConnect', function(event, data) {
		$('.subcommHistoryPanelPlayers').empty();
	});
});