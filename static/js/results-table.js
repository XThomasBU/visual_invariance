(function () {
  var accCols = [0, 3, 6, 9, 12, 15];

  function initModelColumnHover(table) {
    if (!table) return;
    table.querySelectorAll('th.model-head').forEach(function (th) {
      var mi = th.getAttribute('data-mi');
      if (mi === null) return;
      th.addEventListener('mouseenter', function () {
        table.classList.add('dimmed');
        table.querySelectorAll('[data-mi="' + mi + '"]').forEach(function (el) {
          el.classList.add('active-model');
        });
      });
      th.addEventListener('mouseleave', function () {
        table.classList.remove('dimmed');
        table.querySelectorAll('.active-model').forEach(function (el) {
          el.classList.remove('active-model');
        });
      });
    });
  }

  function initResultsTable(cfg) {
    var table = document.getElementById(cfg.tableId);
    var body = document.getElementById(cfg.bodyId);
    var reset = cfg.resetId ? document.getElementById(cfg.resetId) : null;
    if (!table || !body) return;

    var defaultOrder = cfg.rowOrder;

    function highlightBestWorst() {
      var dataRows = Array.from(body.querySelectorAll('tr:not(.row-random)'));
      accCols.forEach(function (colOffset, mi) {
        var tds = dataRows
          .map(function (row) {
            var cells = Array.from(row.querySelectorAll('td[data-mi]'));
            var modelCells = cells.filter(function (c) {
              return +c.getAttribute('data-mi') === mi;
            });
            return modelCells[0];
          })
          .filter(Boolean);

        var vals = tds.map(function (td) {
          return parseFloat(td.textContent);
        });
        var max = Math.max.apply(null, vals);
        var min = Math.min.apply(null, vals);
        tds.forEach(function (td, i) {
          td.classList.remove('best', 'worst');
          if (vals[i] === max) td.classList.add('best');
          else if (vals[i] === min) td.classList.add('worst');
        });
      });
    }

    highlightBestWorst();

    var sortCol = null;
    var sortDir = 1;

    table.querySelectorAll('th.sortable').forEach(function (th) {
      th.addEventListener('click', function () {
        var sc = +th.getAttribute('data-sc');
        if (sortCol === sc) sortDir *= -1;
        else {
          sortCol = sc;
          sortDir = 1;
        }

        table.querySelectorAll('.sort-ind').forEach(function (s) {
          s.textContent = '↕';
        });
        var ind = th.querySelector('.sort-ind');
        if (ind) ind.textContent = sortDir === 1 ? '↓' : '↑';

        var rows = Array.from(body.querySelectorAll('tr'));
        rows.sort(function (a, b) {
          if (a.classList.contains('row-random')) return 1;
          if (b.classList.contains('row-random')) return -1;
          var av = parseFloat(a.getAttribute('data-vals').split(',')[sc - 1]) || 0;
          var bv = parseFloat(b.getAttribute('data-vals').split(',')[sc - 1]) || 0;
          return (bv - av) * sortDir;
        });
        rows.forEach(function (r) {
          body.appendChild(r);
        });
        highlightBestWorst();
      });
    });

    if (reset) {
      reset.addEventListener('click', function () {
        sortCol = null;
        sortDir = 1;
        table.querySelectorAll('.sort-ind').forEach(function (s) {
          s.textContent = '↕';
        });
        defaultOrder.forEach(function (key) {
          var row = body.querySelector('tr[data-key="' + key + '"]');
          if (row) body.appendChild(row);
        });
        highlightBestWorst();
      });
    }

    initModelColumnHover(table);
  }

  initResultsTable({
    tableId: 'rt',
    bodyId: 'rt-body',
    resetId: 'results-reset',
    rowOrder: ['times', 'handwritten', 'omniglot', 'random'],
  });

  initResultsTable({
    tableId: 'rt-pacs',
    bodyId: 'rt-body-pacs',
    resetId: 'results-reset-pacs',
    rowOrder: ['photo', 'art', 'cartoon', 'sketch', 'random'],
  });

  initResultsTable({
    tableId: 'rt-scale',
    bodyId: 'rt-body-scale',
    resetId: 'results-reset-scale',
    rowOrder: ['times', 'handwritten', 'omniglot', 'random'],
  });

  initModelColumnHover(document.getElementById('rt-icl'));
})();
