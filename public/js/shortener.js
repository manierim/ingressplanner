/*
	shortener module
*/

ingressplanner.shortener = new (function() {

	// private vars & functions

	var urls = {};

	return {

		getShortUrl: function(extendedUrl,callback)
		{

			if (typeof urls[extendedUrl]=='undefined')
			{
				if (typeof callback != 'undefined')
				{
					$.post('shortener.php', {extendedUrl: extendedUrl}, function(data, textStatus, xhr) {
						if (data)
						{
							urls[extendedUrl] = data;
							callback(urls[extendedUrl]);
						}
					});
				}
				return null;
			}
			else
			{
				return urls[extendedUrl];
			}

		}

	}

})
