/* @cmd false */
function findParentByTagName(element, tagName) {
    tagName = tagName.toUpperCase();
    while (element && element.nodeName != tagName) {
        element = element.parentNode;
    }
    return element;
}
