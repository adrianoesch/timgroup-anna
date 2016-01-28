/**
 * jspsych-single-stim
 * Josh de Leeuw
 *
 * plugin for displaying a stimulus and getting a keyboard response
 *
 * documentation: docs.jspsych.org
 *
 **/

(function($) {
	jsPsych["anna"] = (function() {

		var plugin = {};
		
		plugin.trial = function(display_element, trial) {

			var interTrialInterval = 1000;
			var interResponseInterval = 500;

			var env = {
			      screenW: screen.width,
			      screenH : screen.height,
			      centX : screen.width*0.5,
			      centY : screen.height*0.5,
			      centLX : screen.width*0.25,
			      centRX : screen.width*0.75
			    };

			var keyMap = {
				'leftarrow' : {
					s: 0,
					c: 1
				},
				'rightarrow' : {
					s: 2,
					c: 3
				},
				'leftarrow-leftarrow' : {
					s: 0,
					c: 1
				},
				'leftarrow-rightarrow': {
					s: 2,
					c: 3
				},
				'rightarrow-leftarrow' : {
					s: 4,
					c: 5
				},
				'rightarrow-rightarrow': {
					s: 6,
					c: 7
				}
			}


			var imgSize = 'height:420px;width:300px;background-size: 300px 420px;';
			var imgStyle = 'position:absolute;margin:8px;';
			var valStyle = 'position:absolute;height:32px;width:100px;text-align:center;font-size:25px;font-weight:bold;'
			var styles = {
				valDivL : valStyle+'top:190px;left:20px;',
				valDivR : valStyle+'top:190px;left:180px;',
				single: {
					imgDiv : imgSize+imgStyle+'left:'+(env.centX-150-4).toString()+'px;top:'+(env.centY-210-4).toString()+'px;'
				},
				double : {
					left : {
						imgDiv : imgSize+imgStyle+'left:'+(env.centX-250-150-4).toString()+'px;top:'+(env.centY-210-4).toString()+'px;'
					},
					right : {
						imgDiv : imgSize+imgStyle+'left:'+(env.centX+250-150-4).toString()+'px;top:'+(env.centY-210-4).toString()+'px;'
					}
				},
				feedbackDiv : 'position:absolute;font-size:20px;font-weight:bold;top:300px;left:'+(env.centX-100).toString()+'px;'
			};

			timeOutHandlers = []

			// function to end trial when it is time
			var end_trial = function(response) {
				for(t=0;t<timeOutHandlers.length;t++){ clearTimeout(timeOutHandlers[t])};
				// give_feedback()
				jsPsych.pluginAPI.cancelKeyboardResponse(keyboardListener);
				keyMapKey = response.map(function(i){return i.key_string}).join('-')

				// gather the data to store for the trial
				var trial_data = {
					responseroot : response[0].key_string,
					timingroot : response[0].rt/1000.0,
				};

				if (response.length==trial.item.combination.length){
					trial_data.payoffS = trial.item.p[keyMap[keyMapKey]['s']];
					trial_data.payoffC = trial.item.p[keyMap[keyMapKey]['c']];
					if(trial.item.combination.length==2){
						trial_data.response2nd = response[1].key_string
						trial_data.timing2nd = (response[1].rt - response[0].rt) / 1000.0
					};
				};

				JSON.flatten = function(data) {
					var result = {};
			    function recurse (cur, prop) {
			        if (Object(cur) !== cur) {
			            result[prop] = cur;
			        } else if (Array.isArray(cur)) {
			             for(var i=0, l=cur.length; i<l; i++)
			                 recurse(cur[i], prop + "[" + i + "]");
			            if (l == 0)
			                result[prop] = [];
			        } else {
			            var isEmpty = true;
			            for (var p in cur) {
			                isEmpty = false;
			                recurse(cur[p], prop ? prop+"."+p : p);
			            }
			            if (isEmpty && prop)
			                result[prop] = {};
			        }
			    }
			    recurse(data, "");
			    return result;
				}

				var flatItem = JSON.flatten(trial.item);
				for (var key in flatItem){
					trial_data[key] = flatItem[key];
				};

				jsPsych.data.write(trial_data);
				console.log(trial_data)
				if (response.length==trial.item.combination.length){
					var feedBackStr = "<div id='feedback' style='"+styles.feedbackDiv+"'>"+
														"<p>Feedback</p>"+
														"<p>Self: "+trial_data.payoffS.toString()+"</p>"+
														"<p>Charity: "+trial_data.payoffC.toString()+"</p>"+
														"</div>"
					// clear the display
					display_element.html(feedBackStr);
				}else{
					display_element.html('');
				}

				// move on to the next trial
				setTimeout(jsPsych.finishTrial,interTrialInterval);
			};


			var kbResps = []
			// function to handle responses by the subject
			var keyboardCallback = function(kbInfo) {
				kbResps.push(kbInfo)
				if (trial.item.combination.length==1){
					end_trial(kbResps)
				}else{
					timeOutHandlers.push(setTimeout(end_trial,interResponseInterval,kbResps));
					if (kbResps.length==1){
						if(kbInfo.key_string=='leftarrow'){
							$('#rightImgDiv').remove();
							$('#leftImgDiv').css('border','solid 8px rgb(60,255,0)');
							$('#leftImgDiv').css('margin','0px');
						}else{
							$('#leftImgDiv').remove();
							$('#rightImgDiv').css('border','solid 8px rgb(60,255,0)');
							$('#rightImgDiv').css('margin','0px');
						}
					}else{
						end_trial(kbResps)
					}
				};
			};

			//display images
			var displayStimuli = function(){
				if (trial.item.arrangement.length==1){
				display_element.html(
				"<div id='singleImgDiv' class='imgDiv' style='"+
					styles.single.imgDiv+
					"background-image:url(./"+
					trial.item.img[0].path+
					");'></div>"
				);
				}else{
					display_element.html(
					"<div id='leftImgDiv' class='imgDiv' style='"+
						styles.double.left.imgDiv+
						"background-image:url(./"+
						trial.item.img[0].path+
						");'></div>"+
					"<div id='rightImgDiv' class='imgDiv' style='"+
						styles.double.right.imgDiv+
						"background-image:url(./"+
						trial.item.img[1].path+
						");'></div>"
					);
				}
				// display values
				var imgDivs = document.getElementsByClassName('imgDiv')
				for(i=0;i<imgDivs.length;i++){
					if (trial.item.arrangement[i]=='1'){ //1=P
						var s1 = [ pd[(i*4)], pd[(i*4)+1] ].join('/')
						var s2 = [ pd[(i*4)+2], pd[(i*4)+3] ].join('/')
						imgDivs[i].innerHTML = "<div id='singleVal' style="+styles.valDivL+"background-color:"+
							imgs[i].bgColor+";>\
							<p style='margin:auto;color:"+imgs[i].textColor+";'>"+s1+"</p></div>"+
							"<div id='singleVal' style="+styles.valDivR+"background-color:"+
							imgs[i].bgColor+";>\
							<p style='margin:auto;color:"+imgs[i].textColor+";'>"+s2+"</p></div>";
					}else{
						imgDivs[i].innerHTML = "<div id='singleVal' style="+styles.valDivL+"background-color:black;>\
							<p style='margin:auto;color:white;'>##/##</p></div>"+
							"<div id='singleVal' style="+styles.valDivR+"background-color:black;>\
							<p style='margin:auto;color:white;'>##/##</p></div>";
					}
				}
			};

			displayStimuli()

			// start the response listener
			var keyboardListener = jsPsych.pluginAPI.getKeyboardResponse({
				callback_function: keyboardCallback,
				valid_responses: [37,39],
				rt_method: 'date',
				persist: true,
				allow_held_key: false
			});
		};

		return plugin;
	})();
})(jQuery);