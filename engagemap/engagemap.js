'use strict';

(function () {
  $(document).ready(function () {
    const table = $('#parameterTable');
    const tableBody = table.children('tbody');

    // This is the entry point into the extension.  It initializes the Tableau Extensions Api, and then
    // grabs all of the parameters in the workbook, processing each one individually.
    tableau.extensions.initializeAsync().then(function () {
      tableau.extensions.dashboardContent.dashboard.getParametersAsync().then(function (parameters) {
        parameters.forEach(function (p) {
          p.addEventListener(tableau.TableauEventType.ParameterChanged, onParameterChange);
          parameterRow(p).appendTo(tableBody);
        });

        // This is used to manipulate what part of the UI is visible.  If there are no parameters
        // found, we want to give you a message to tell you that you need to add one, otherwise, we
        // show the table we created.
        $('#loading').addClass('hidden');
        if (parameters.length === 0) {
          $('#addParameterWarning').removeClass('hidden').addClass('show');
        } else {
          $('#parameterTable').removeClass('hidden').addClass('show');
        }
      });
    });
  });

  // When the parameter is changed, we recreate the row with the updated values.  This keeps the code
  // clean, and emulates the approach that something like React does where it "rerenders" the UI with
  // the updated data.
  //
  // To avoid multiple layout processing in the browser, we build the new row unattached to the DOM,
  // and then attach it at the very end.  This helps avoid jank.
  function onParameterChange (parameterChangeEvent) {
    parameterChangeEvent.getParameterAsync().then(function (param) {
      const newRow = parameterRow(param);
      const oldRow = $("tr[data-fieldname='" + param.id + "'");
      oldRow.replaceWith(newRow);
    });
  }

  // This function creates a subtree of a row for a specific parameter.
  function parameterRow (p) {
    let row = $('<tr>').attr('data-fieldname', p.id);

    let from = '';
    let to = ''
    try {
        let src = $('#map_iframe').attr('src');
        let indexFrom = src.indexOf("from=");
        let indexTo = src.indexOf("&to=");
        from = src.substring(indexFrom + 5, indexTo);
        to = src.substring(indexTo + 4);

        if (p.name.toLowerCase().includes("begin") ||
            p.name.toLowerCase().includes("start") ||
            p.name.toLowerCase().includes("from")) {
            from = Date.parse(p.currentValue.value);
        } else if (p.name.toLowerCase().includes("end") ||
            p.name.toLowerCase().includes("to")) {
            to = Date.parse(p.currentValue.value);
        }

        $('#map_iframe').attr('src', 'https://driveota.nvidia.com/admin/ui/files/disengagement_map.htm?from=' + from + '&to=' + to);
        $('#iframe_url').text('https://driveota.nvidia.com/admin/ui/files/disengagement_map.htm?from=' + from + '&to=' + to
         + p.name.toLowerCase() + ', '
         + p.name.toLowerCase().includes("start")  + ', '
         + p.name.toLowerCase().includes("end")  + ', '
         + from  + ', '
         + to + ','
         + p.currentValue.value  + ', '
         + Date.parse(p.currentValue.value)  + ', '
         );
    } catch (e) {
        $('#iframe_url').text(e);
    }

    return row;
  }
})();