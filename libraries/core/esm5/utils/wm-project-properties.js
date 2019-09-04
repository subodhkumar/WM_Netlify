var properties = {};
export function getWmProjectProperties() {
    if (window._WM_APP_PROPERTIES) {
        return window._WM_APP_PROPERTIES;
    }
    else {
        return properties;
    }
}
export function setWmProjectProperties(props) {
    Object.setPrototypeOf(properties, props);
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoid20tcHJvamVjdC1wcm9wZXJ0aWVzLmpzIiwic291cmNlUm9vdCI6Im5nOi8vQHdtL2NvcmUvIiwic291cmNlcyI6WyJ1dGlscy93bS1wcm9qZWN0LXByb3BlcnRpZXMudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsSUFBTSxVQUFVLEdBQVEsRUFBRSxDQUFDO0FBSTNCLE1BQU0sVUFBVSxzQkFBc0I7SUFDbEMsSUFBSSxNQUFNLENBQUMsa0JBQWtCLEVBQUU7UUFDM0IsT0FBTyxNQUFNLENBQUMsa0JBQWtCLENBQUM7S0FDcEM7U0FBTTtRQUNILE9BQU8sVUFBVSxDQUFDO0tBQ3JCO0FBQ0wsQ0FBQztBQUVELE1BQU0sVUFBVSxzQkFBc0IsQ0FBQyxLQUFVO0lBQzdDLE1BQU0sQ0FBQyxjQUFjLENBQUMsVUFBVSxFQUFFLEtBQUssQ0FBQyxDQUFDO0FBQzdDLENBQUMiLCJzb3VyY2VzQ29udGVudCI6WyJjb25zdCBwcm9wZXJ0aWVzOiBhbnkgPSB7fTtcblxuZGVjbGFyZSBjb25zdCB3aW5kb3c7XG5cbmV4cG9ydCBmdW5jdGlvbiBnZXRXbVByb2plY3RQcm9wZXJ0aWVzKCkge1xuICAgIGlmICh3aW5kb3cuX1dNX0FQUF9QUk9QRVJUSUVTKSB7XG4gICAgICAgIHJldHVybiB3aW5kb3cuX1dNX0FQUF9QUk9QRVJUSUVTO1xuICAgIH0gZWxzZSB7XG4gICAgICAgIHJldHVybiBwcm9wZXJ0aWVzO1xuICAgIH1cbn1cblxuZXhwb3J0IGZ1bmN0aW9uIHNldFdtUHJvamVjdFByb3BlcnRpZXMocHJvcHM6IGFueSkge1xuICAgIE9iamVjdC5zZXRQcm90b3R5cGVPZihwcm9wZXJ0aWVzLCBwcm9wcyk7XG59XG4iXX0=