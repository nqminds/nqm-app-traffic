(function () {
	L.TextIcon = L.Icon.extend({
		options: L.extend({
			className: 'leaflet-div-icon',
			getIconUrl: function(icontype, color) {
				if (icontype=='plain')
					return '/images/marker-icon.png'
				else if (icontype=='number') 
					return '/images/marker-hole-'+ (color || 'blue') +'.svg' 
			},
			shadowUrl:""
		}, new L.Icon.Default().options),

	 	initialize: function(options) {
			
	 		L.extend(options, {
	 			shadowUrl: '/images/marker-shadow.png'
	 		});
			
	 		L.setOptions(this, options);
	 		var iconUrl = this.options.getIconUrl(this.options.icontype, this.options.color);
	 		this._iconImg = this._createImg(iconUrl);

			this._textDiv = document.createElement('div');
			this._textDiv.className = 'icon-text';
			this._textDiv.innerHTML = this.options.text || '';
	 	},
		createIcon: function() {
			
			var div = document.createElement('div');
			div.appendChild(this._iconImg);
			div.appendChild(this._textDiv);

			this._setIconStyles(div, 'icon');
			return div;
		},
		setType: function(icontype, color, text) {
			let icontext = (icontype == 'plain')?'':text;
			this._iconImg.src = this.options.getIconUrl(icontype, color);
			this._textDiv.innerHTML = icontext || '';
		}
	});	
}());
