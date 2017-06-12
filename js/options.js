var userSettings = [];

$(function(){
	UIBuilder.update();

	$('button#add-new').on('click',function(){
		UIBuilder.addRow(undefined, true);
	});

	$('button#save').on('click',function(){
		UIBuilder.save();
	});

	var expanded = false;

	$('.collapse_msg').click(function(){
		var target = $(this).data('target');
		$(target).slideToggle();
		expanded = !expanded;
		if(expanded){
			$(this).text('Hide Tips');
		}else{
			$(this).text('Show Tips');
		}
	});

});

var UIBuilder = {
	animating: false,
	save: function(){
		userSettings = [];

		$('.custom-user-agents row').each(function(){
			var $theDomain = $(this).find($('input[name="domain"]')).val();
			var $theAgentShort = $(this).find($(':selected')).val();
			var $theAgentLong = "";

			for(var i in UserAgentList){
				for(var x in UserAgentList[i].UserAgents){
					var selectedItem = UserAgentList[i].UserAgents[x]
					if(selectedItem.Id == $theAgentShort){
						$theAgentLong = selectedItem.UserAgent;
					}
				}
			}
			userSettings.push({
				domain: $theDomain,
				agent: $theAgentLong
			});
		});
		chrome.storage.sync.set({
			"userSettings": userSettings
		}, function(){
			UIBuilder.update();
			var $saveMessage = $('<p class="status">Saved!</p>');
			$('body').prepend($saveMessage);
			$saveMessage.delay(1800).fadeOut(function(){
				$(this).remove();
			});
			chrome.tabs.reload();
		});
	},
	update: function(callback){
		chrome.storage.sync.get(function(items){
			if (typeof items.userSettings !== 'undefined') {
				userSettings = items.userSettings;
			}else{
				userSettings = [];
			}

			$('.custom-user-agents').text('');

			if(userSettings.length == 0){
				UIBuilder.addRow();
			}
			for(var i in userSettings){
				UIBuilder.addRow({
					domain: userSettings[i].domain,
					agent: userSettings[i].agent
				});
			}

			if (typeof callback !== 'undefined') {
				callback();
			}
		});
	},
	addRow: function(customOptions, animated=false){
		var theDomain = "";
		var theAgent = "";
		if (typeof customOptions !== 'undefined') {
			theAgent = customOptions.agent;
			theDomain = customOptions.domain;
		}else{
			theAgent = false;
			theDomain = "";
		}
		var the_agent_list = [];

		for(var i in UserAgentList){
			the_agent_list.push({
				text: "~"+UserAgentList[i].Name+"~",
				value: UserAgentList[i].Id,
				disabled: true
			});
			for(var x in UserAgentList[i].UserAgents){
				var selectedItem = UserAgentList[i].UserAgents[x]
				var isSelected = false;
				if(selectedItem.UserAgent == theAgent){
					isSelected = true;
				}
				the_agent_list.push({
					text: selectedItem.Name,
					value: selectedItem.Id,
					selected: isSelected
				});
			}
		}
		var randomNum = Math.floor(Math.random()*999999999);
		var html = UIBuilder.obj({
			type: "row",
			parameters: 'data-identifier="'+randomNum+'"',
			child: UIBuilder.obj({
				name: "domain",
				type: "div",
				parameters: 'class="six columns"',
				child: UIBuilder.objInput({
					type: "text",
					name: "domain",
					placeholder: "ex. google.com",
					child: theDomain
				})
			})+UIBuilder.obj({
				name: "agent-row",
				type: "div",
				parameters: 'class="five columns"',
				child: UIBuilder.objSelect(the_agent_list)
			})+UIBuilder.obj({
				name: "Delete",
				type: "div",
				parameters: 'class="one column" id="delete-agent"',
				child: "X"
			})
		});
		if(animated){
			var $html = $(html);
			$html.toggle();
			$('.custom-user-agents').append($html);
			$html.slideToggle();
		}else{
			$('.custom-user-agents').append(html)
		}
		$('row[data-identifier="'+randomNum+'"] #delete-agent').on('click', function(){
			$(this).parent().slideToggle(function(){
				$(this).remove();
			});
		});
	},
	obj: function(options = {type:"div", parameters:"", child:null}){
		var closer = options.type;
		if(options.child == null){
			options.child = "";
		}
		if(options.selfClosing){
			closer = "";
		}else{
			closer = "</"+closer+">";
		}
		return "<"+options.type+" "+options.parameters+">"+options.child+closer;
	},
	objInput: function(options={type: "text", name: "your-input", placeholder: "", child:""}){
		return this.obj({
			type: "input",
			parameters: 'type="'+options.type+'" name="'+options.name+'" placeholder="'+options.placeholder+'" value="'+options.child+'"',
			selfClosing: true,
		})
	},
	objSelect: function(optionArray){
		var optionsHTML = "";

		for(var i in optionArray){
			var text = optionArray[i].text;
			var value = optionArray[i].value;
			var selected = optionArray[i].selected;
			var disabled = optionArray[i].disabled;
			if(selected){
				selected = "selected";
			}else{
				selected = "";
			}
			if(disabled){
				disabled = "disabled";
			}else{
				disabled = "";
			}
			optionsHTML += this.obj({
				type: "option",
				parameters: 'value="'+value+'" ' + selected + " "+ disabled,
				child: text
			});
		}

		return this.obj({
			type: "select",
			parameters: '',
			child: optionsHTML
		})
	}
};
