/* @cmd false */
function documentCreateElement(tagName, attribute, styles) {
    var element, style;
    element = document.createElement(tagName);
    style = element.style;

    attribute && each(attribute, function (key, value) {
        element[key] = value;
    });

    style && styles && each(styles, function (key, value) {
        style[key] = value;
    });

    return element;
}
