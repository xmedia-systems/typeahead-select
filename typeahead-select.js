(function($) {
    var matcher = function(datums, matchField) {
      return function findMatches(q, cb) {
        var matches, substringRegex;
        // an array that will be populated with substring matches
        matches = [];
        // regex used to determine if a string contains the substring `q`
        substrRegex = new RegExp(q, 'i');
        // iterate through the pool of strings and for any string that
        // contains the substring `q`, add it to the `matches` array
        $.each(datums, function(i, datum) {
          if (substrRegex.test(datum[matchField]))
            matches.push(datum);
        });

        cb(matches);
      };
    };

    var initSelect = function(select, options) {
        var datums = [];
        select.find("option").each(function (i, el) {
            datums.push({value: el.attributes["value"].value, label: el.textContent});
        });

        var inp = $('<input>');
        inp.attr("class", select.attr("class"));
        inp.attr("style", select.attr("style"));

        select.after(inp);
        select.hide();

        var typeahead = $.fn.typeahead.apply(inp, [{
                hint: true,
                highlight: true,
                minLength: 0
            },
            {
                displayKey: "label",
                source: matcher(datums, "label")
            }]
        );
        // add the dropdown button (bootstrap style)
        inp.wrap('<div class="input-group" />');
        inp.after('<div class="input-group-btn">'+
            '<button type="button" class="btn btn-default"><span class="caret"></span></button>'+
          '</div>');
        inp.next(".input-group-btn").children("button").click(function () {
            var tt = typeahead.data("ttTypeahead");
            if(!tt) return;
            if(!tt.dropdown.isVisible()) {
                tt.dropdown.update("");
                tt.dropdown.open();
            }
            else {
                tt.dropdown.close();
            }
        });
        // internal callbacks
        var syncSelect = function(e, datum) {
            select.val(datum.value);
        };
        var syncInput = function(e) {
            var inpval = $(this).val();
            var selectval = select.val();
            var found = false;
            var datum;
            $.each(datums, function (i, item) {
                if(item.label == inpval) {
                    datum = item;
                    return false;
                }
                if(item.value == selectval) {
                    datum = item;
                }
            });
            if(datum.label != inpval) {
                $(this).typeahead("val", datum.label).typeahead('close')
            }
            syncSelect(null, datum);
        };
        syncInput.apply(typeahead, []);
        // sync with select
        typeahead.on("typeahead:selected typeahead:autocompleted", syncSelect);
        // restrict to select
        typeahead.on("change", syncInput);

        return typeahead;
    };


    $.fn.typeaheadselect = function(method, options) {
        if(method)
            return $.fn.typeahead.apply(this, method);
        else
            return this.each(function (i, el) {
                initSelect($(el), options);
            });
    }
})(jQuery);
