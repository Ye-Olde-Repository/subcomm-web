$(document).ready(function() {
	var ChatTab = function() {
		this._connected = false;
	};
	
	ChatTab._instance = null;
	
	ChatTab.get = function() {
		if (ChatTab._instance === null) {
			ChatTab._instance = new ChatTab();
		}
		
		return ChatTab._instance;
	};
	
	ChatTab.prototype = {
		toggleConnected: function(container, connected) {
			if (this._connected || !connected) { // only react to new connections
				this._connected = connected;
				return;
			}
			
			this._connected = connected;
			// change to chat tab as soon as the first message matches
			container.changeTab('subcommTabChat');
		}
	};
	
	/**
	 * Creates the <p> tag and content for showing a message.
	 * @param container
	 * @param message
	 * @returns string
	 */
    function createMessageHtml(container, message, showTimestamp, limitContent) {
    	if (!message.match(/^MSG:/)) {
			return;
		}
    	
    	showTimestamp = ( typeof(showTimestamp) !== 'undefined' ? showTimestamp : true );
    	limitContent = ( typeof(limitContent) !== 'undefined' ? limitContent : false );
		var timestamp = ( showTimestamp ? SubcommUIUtility.makeTimestamp() : '' );
		
    	var matches = message.match(/^MSG:(?:ARENA|SYSOP):(.+)$/);
		if (matches) {
			ChatTab.get().toggleConnected(container, true);
			return arenaHtml();
		}
		
    	matches = message.match(/^MSG:(.+?):(.+?):(.+)$/);
    	if (matches) {
    		ChatTab.get().toggleConnected(container, true);
    		return pubHtml();
    	}
    	
    	function arenaHtml() {
    		var content = formatContent(matches[1]);
    		return '<p>' + timestamp + '<span style="color: green;">' + content + '</span></p>';
    	}
    	
    	function pubHtml() {
    		var target = matches[1];
    		var origin = matches[2];
    		var content = formatContent(matches[3]);
    		
    		var color;
    		switch (target) {
    		case 'FREQ':
    			color = 'orange';
    			break;
    		case 'PUB':
    		default:
    			color = 'blue';
    		}
    		
    		return '<p>' + timestamp + '<span style="color: ' + color + ';">&lt;' + origin + '&gt;</span> ' + content + '</p>';
    	}
    	
    	function formatContent(content) {
    		if (limitContent && content.length > 80)
    			content = content.substring(0, 80);

    		// taken from https://github.com/uudashr/jquery-linkify/blob/master/jquery.linkify.js
    		content = content.replace(/((http|https|ftp)\:\/\/|\bw{3}\.)[a-z0-9\-\.]+\.[a-z]{2,3}(:[a-z0-9]*)?\/?([a-z0-9\-\._\?\,\'\/\\\+&amp;%\$#\=~])*/gi, "<a href=\"$&\" target=\"_blank\">$&</a>");
    		return content;
    	}
    }
    
	$('.subcommContainer').bind('subcommMessage', function(event, data) {
		var container = data.container;
		var message = data.message;

		var messageHtml = createMessageHtml(container, message, true);
		if (!messageHtml) {
			return;
		}
		
		$('.subcommHistoryPanelChat').each(function(index, element) {
			$(this).append(messageHtml);
			$(this).parent().scrollTop($(this).parent()[0].scrollHeight);
		});
	});
	
	/**
	 * Prints chat-specific banner messages if found.
	 */
	$('.subcommContainer').bind('subcommBannerMessage', function(event, data) {
		var container = data.container;
		var message = data.message;
		var messageHtml = createMessageHtml(container, message, false, true);
		if (!messageHtml) {
			return;
		}

		$('.subcommBanner').each(function(index, element) {
			$(this).html(messageHtml);
		});
		
		event.stopImmediatePropagation();
	});
	
	$('.subcommInputFormChat').submit(function(event) {
		event.stopPropagation();
		event.preventDefault();

		var container = SubcommUIContainer.getByDiv($(this));
		var input = $($(this).children('input')[0]);
        var message = input.val().trim();
		ISubcommUI.get().chatPublic(container.session.uri, message);
		input.val('');
		var composed = 'MSG:PUB:' + container.session.username + ':' + message;
		$('#'+container.id).triggerHandler('subcommMessage', { container: container, message: composed });
	});
	
	$('.subcommContainer').bind('subcommConnect', function(event, data) {
		// clear chat history from last connection
		$('.subcommHistoryPanelChat').empty();
	});
	
	$('.subcommContainer').bind('subcommDisconnect', function(event, data) {
		ChatTab.get().toggleConnected(false);
	});
});