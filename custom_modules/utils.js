const fs = require('fs');

function getSortedString(line) {
    const object = sortKeys(line, {
      deep: true
    });
    if (object.body) {
      if (object.body.campaign_info) {
        object.body.campaign_info.sort((a, b) => a.cid < b.cid ? -1 : 1);
        object.body.campaign_info.forEach((campaign, index) => {
          if (campaign.widgets) {
            campaign.widgets.sort((a, b) => a.id < b.id ? -1 : 1);
            campaign.widgets.forEach((widget, index) => {
              if (campaign.widgets[index].widgets) {
                campaign.widgets[index].widgets.sort((a, b) => a.id < b.id ? -1 : 1);
              }
            });
          }
          object.body.campaign_info[index] = campaign
        });
      }
      if (object.body.event_list) {
        object.body.event_list.sort((a, b) => a < b ? -1 : 1);
      }
      object.body = JSON.stringify(object.body);
    } else {
      object.body = 'error';
    }
  
    return JSON.stringify(object);
  }
  
  
  function shuffleArray(array) {
    const cloned = clone(array);
    for (var i = cloned.length - 1; i > 0; i--) {
      var j = Math.floor(Math.random() * (i + 1));
      var temp = cloned[i];
      cloned[i] = cloned[j];
      cloned[j] = temp;
    }
    return clone;
  }
  
  function mkdirp(dirPath) {
    if (!fs.existsSync(dirPath)) {
      fs.mkdirSync(dirPath, 0744);
    }
  }
  
  function clone(array) {
    return JSON.parse(JSON.stringify(array));
  }
  
  module.exports = {
    mkdirp: mkdirp,
    shuffleArray: shuffleArray,
    clone: clone
  }