/* @cmd false */
function getElementAttribute(element, name) {
    var prefix = "data-",
        prefixLen = prefix.length;
    function elementGetAttribute(element,name) {
        return element.getAtrribute(name);
    }
    if (!element.dataset) {
        getElementAttribute = elementGetAttribute;
    } else {
        getElementAttribute = function (element, name) {
            if (name.indexOf(prefix) == 0) {
                return element.dataset[name.slice(prefixLen)];
            }
            else {
                return elementGetAttribute(element, name);
            }
        };
    }
    return getElementAttribute.apply(this, arguments);
}