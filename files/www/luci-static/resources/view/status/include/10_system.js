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
var callCPUUsage = declareCall('luci', 'getCPUUsage');
var callTempInfo = declareCall('luci', 'getTempInfo');
var callOnlineUsers = declareCall('luci', 'getOnlineUsers');

return baseclass.extend({
  title: _('System'),

  load: function () {
    return Promise.all([
      L.resolveDefault(callSystemBoard(), {}),
      L.resolveDefault(callSystemInfo(), {}),
      L.resolveDefault(callCPUBench(), {}),
      L.resolveDefault(callCPUInfo(), {}),
      L.resolveDefault(callCPUUsage(), {}),
      L.resolveDefault(callTempInfo(), {}),
      L.resolveDefault(callLuciVersion(), {
        revision: _('unknown version'),
        branch: 'LuCI'
      }),
      L.resolveDefault(callOnlineUsers(), {})
    ]);
  },

  render: function (data) {
    var boardinfo = data[0];
    var systeminfo = data[1];
    var cpubench = data[2];
    var cpuinfo = data[3];
    var cpuusage = data[4];
    var tempinfo = data[5];
    var luciversion = data[6];
    var onlineusers = data[7];
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
      _('Firmware'), 'DOTYWRT V1.0',
      _('Version'), boardinfo?.release?.description?.split(' r')[0] || '',
      _('Kernel'), boardinfo.kernel,
      _('Local Time'), datestr,
      _('Uptime'), systeminfo.uptime ? '%t'.format(systeminfo.uptime) : null,
      _('CPU usage (%)'), cpuusage.cpuusage,
      _('Online Users'), onlineusers ? onlineusers.onlineusers : null
    ];

    if (tempinfo.tempinfo) {
      fields.splice(2, 0, _('Temperature'));
      fields.splice(3, 0, tempinfo.tempinfo);
    }

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
