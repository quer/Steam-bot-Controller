module.exports = {
    /**
     * Mode - when can this module be active
     * 0 = sinkel
     * 1 = multi at once
     */
    mode: {
        sinkel: 0,
        multi: 1
    },
    field: {
        type: {
            text: 0,
            bool: 1,
            textField: 2
        }
    }
}