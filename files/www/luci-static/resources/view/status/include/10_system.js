'use strict';

'require baseclass';
'require fs';
'require rpc';

function declareCall(object, method) {
  return rpc.declare({ object, method });
}

var callLuciVersion = declareCall('luci', 'getVersion');
var callSystemBoard = declareCall('system', 'board');
var callSystemInfo = declareCall('system', 'info');
var callCPUBench = declareCall('luci', 'getCPUBench');
var callCPUInfo = declareCall('luci', 'getCPUInfo');

return baseclass.extend({
  title: _('System'),

  load: function () {
    return Promise.all([
      L.resolveDefault(callSystemBoard(), {}),
      L.resolveDefault(callSystemInfo(), {}),
      L.resolveDefault(callCPUBench(), {}),
      L.resolveDefault(callCPUInfo(), {}),
      L.resolveDefault(callLuciVersion(), {
        revision: _('unknown version'),
        branch: 'LuCI'
      })
    ]);
  },

  render: function (data) {
    var boardinfo = data[0];
    var systeminfo = data[1];
    var cpubench = data[2];
    var cpuinfo = data[3];
    var luciversion = data[4];

    luciversion = luciversion.branch + ' ' + luciversion.revision;

    var datestr = null;
    if (systeminfo.localtime) {
      var date = new Date(systeminfo.localtime * 1000);
      datestr = '%04d-%02d-%02d %02d:%02d:%02d'.format(
        date.getUTCFullYear(),
        date.getUTCMonth() + 1,
        date.getUTCDate(),
        date.getUTCHours(),
        date.getUTCMinutes(),
        date.getUTCSeconds()
      );
    }

    var fields = [
      _('Firmware'), 'DOTYWRT XXXX',
      _('Version'), boardinfo?.release?.description?.split(' r')[0] || '',
      _('Kernel'), boardinfo.kernel,
      _('Local Time'), datestr,
      _('Uptime'), systeminfo.uptime ? '%t'.format(systeminfo.uptime) : null,
      _('Release Date'), 'DDDD'
    ];

    var table = E('table', { 'class': 'table' });

    for (var i = 0; i < fields.length; i += 2) {
      table.appendChild(E('tr', { 'class': 'tr' }, [
        E('td', { 'class': 'td left', 'width': '33%' }, [fields[i]]),
        E('td', { 'class': 'td left' }, [fields[i + 1] != null ? fields[i + 1] : '?' ])
      ]));
    }

    return table;
  }
});
