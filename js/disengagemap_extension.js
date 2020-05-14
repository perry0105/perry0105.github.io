'use strict';

(function () {
  $(document).ready(function () {
    // This is the entry point into the extension.  It initializes the Tableau Extensions Api, and then
    // grabs all of the parameters in the workbook, processing each one individually.
    tableau.extensions.initializeAsync().then(function () {
      tableau.extensions.dashboardContent.dashboard.getParametersAsync().then(function (parameters) {
        parameters.forEach(function (p) {
          p.addEventListener(tableau.TableauEventType.ParameterChanged, onParameterChange);
          changeFilters(p);
        });
      });
    });
  });

  function onParameterChange (parameterChangeEvent) {
    parameterChangeEvent.getParameterAsync().then(function (param) {
      changeFilters(param);
    });
  }

  function changeFilters (p) {
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

        $('#map_iframe').attr('src', 'https://alfred-staging.nvidia.com:8090?from=' + from + '&to=' + to);
    } catch (e) {
    }
  }
})();