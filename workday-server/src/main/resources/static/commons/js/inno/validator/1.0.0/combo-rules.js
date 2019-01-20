define({
    "FirstOrderAmount": {
        "rule": "min{min:3000}"
    },
    "Remark2000": {
        "rule": "maxlength{max:2000}"
    },
    "Date": {
        "rule": "date"
    },
    "Remark1500": {
        "rule": "maxlength{max:1500}"
    },
    "PackageWay": {
        "rule": "maxlength{max:128}"
    },
    "PackageQuantity": {
        "rule": "uInteger min{min:1} max{max:100000000}"
    },
    "ShippingMark": {
        "rule": "maxlength{max:300}"
    },
    "Percentage": {
        "rule": "number min{min:0.01} max{max:100} precision{point:2}"
    },
    "Unit": {
        "rule": "maxlength{max:50}"
    },
    "Price": {
        "rule": "number min{min:0.01} max{max:10000000} precision{point:2}"
    },
    "Quantity": {
        "rule": "pInteger max{max:100000}"
    },
    "ProductDescription": {
        "rule": "maxlength{max:2000}"
    },
    "Email": {
        "rule": "email maxlength{max:128}"
    },
    "Chinese":{
        "rule":"chinese"
    }
});