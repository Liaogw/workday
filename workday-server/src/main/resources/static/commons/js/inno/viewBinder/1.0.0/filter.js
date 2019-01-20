define(function(require){

    var addFilter = function(filter, callback){
        addFilter[filter] = callback;
    };

    return addFilter;

});