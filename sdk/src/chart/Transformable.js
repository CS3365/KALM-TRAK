/**
 * @class Ext.chart.Transformable
 *
 * Transformable is a mixin for chart items (axes, series, etc.) which makes them capable
 * of having their surfaces panned and zoomed via transformations.
 *
 * There are two modes of transformation that this mixin supports:
 *
 * - **Persistent transform** - This is a logical transformation, saved to the item as properties
 *   {@link #panX}, {@link #panY}, {@link #zoomX}, and {@link #zoomY}. The item's drawing logic must
 *   honor these properties and should be explicitly re-run after updating the persistent transform.
 * - **Fast transform** - This is a pixel-wise transform applied (via CSS3) to the {@link Ext.draw.Surface}
 *   element itself. As this does not perform a redraw of the surface, vector shapes currently
 *   rendered to the surface will be deformed by this transform. This is meant to only be transient,
 *   and to have {@link #syncToFastTransform} called once the speed is no longer required to apply
 *   the fast transform parameters into the persistent transform properties.
 */
Ext.chart.Transformable = Ext.extend(Object, {

    /**
     * @property zoomX
     * @type {Number}
     * The horizontal zoom transformation factor for this chart item. Defaults to 1.
     */
    zoomX: 1,
    /**
     * @property zoomY
     * @type {Number}
     * The vertical zoom transformation factor for this chart item. Defaults to 1.
     */
    zoomY: 1,
    /**
     * @property panX
     * @type {Number}
     * The horizontal pan transformation offset for this chart item. Defaults to 0.
     */
    panX: 0,
    /**
     * @property panY
     * @type {Number}
     * The vertical pan transformation offset for this chart item. Defaults to 0.
     */
    panY: 0,

    constructor: function() {
        this.addEvents(
            /**
             * @event transform
             * Fired after a transformation has been applied to this chart item.
             * @param {Object} this
             * @param {Boolean} fast True if it is a CSS3 fast transform, false if a persistent transform
             */
            'transform'
        );
    },

    /**
     * Directly sets the persistent pan/zoom transform properties for this chart item. Removes any
     * active fast transform and updates the {@link #panX}, {@link #panY}, {@link #zoomX}, and
     * {@link #zoomY} properties to match the supplied arguments.
     * @param {Number} panX
     * @param {Number} panY
     * @param {Number} zoomX
     * @param {Number} zoomY
     */
    setTransform: function(panX, panY, zoomX, zoomY) {
        var me = this;
        me.panX = panX;
        me.panY = panY;
        me.zoomX = zoomX;
        me.zoomY = zoomY;
        me.clearFastTransform();
        Ext.each(me.getTransformableSurfaces(), function(surface) {
            surface.setSurfaceTransform(panX, panY, zoomX, zoomY);
        });
        me.fireEvent('transform', me, false);
    },

    /**
     * Adjusts the persistent pan/zoom transform properties for this chart item. Removes any
     * active fast transform and adjusts the existing {@link #panX}, {@link #panY}, {@link #zoomX}, and
     * {@link #zoomY} properties by the supplied arguments.
     * @param {Number} panX
     * @param {Number} panY
     * @param {Number} zoomX
     * @param {Number} zoomY
     */
    transformBy: function(panX, panY, zoomX, zoomY) {
        var me = this;
        me.setTransform(me.panX + panX, me.panY + panY, me.zoomX * zoomX, me.zoomY * zoomY);
    },

    /**
     * Sets the pan/zoom transformation for this chart item, using CSS3 for fast hardware-accelerated
     * transformation. The existing persistent {@link #panX}, {@link #panY}, {@link #zoomX}, and
     * {@link #zoomY} properties will be left alone and the remaining transform required to reach
     * the supplied arguments will be applied using a CSS3 transform.
     * @param {Number} panX
     * @param {Number} panY
     * @param {Number} zoomX
     * @param {Number} zoomY
     */
    setTransformFast: function(panX, panY, zoomX, zoomY) {
        var me = this;
        panX -= me.panX;
        panY -= me.panY;
        zoomX /= me.zoomX;
        zoomY /= me.zoomY;
        me.clearFastTransform();
        me.transformByFast(panX, panY, zoomX, zoomY);
    },

    /**
     * Adjusts the pan/zoom transformation for this chart item, using CSS3 for fast hardware-accelerated
     * transformation. The existing persistent {@link #panX}/{@link #panY}/{@link #zoomX}/{@link #zoomY}
     * properties will be left alone and the supplied arguments will be added to the existing transform
     * using CSS3.
     * @param {Number} panX
     * @param {Number} panY
     * @param {Number} zoomX
     * @param {Number} zoomY
     */
    transformByFast: function(panX, panY, zoomX, zoomY) {
        this.setFastTransformMatrix(this.getFastTransformMatrix().translate(panX, panY).scale(zoomX, zoomY, 0, 0));
    },

    /**
     * Returns a {@link Ext.draw.Matrix} representing the total current transformation for this chart
     * item, including both the persistent {@link #panX}/{@link #panY}/{@link #zoomX}/{@link #zoomY}
     * and any additional CSS3 fast transform that is currently applied.
     * @return {Ext.draw.Matrix}
     */
    getTransformMatrix: function() {
        var me = this;
        return me.getFastTransformMatrix().clone().translate(me.panX, me.panY).scale(me.zoomX, me.zoomY, 0, 0);
    },

    /**
     * Returns a {@link Ext.draw.Matrix} representing the CSS3 fast transform currently applied to this
     * chart item. If no fast transform is applied a Matrix in its default state will be returned. This
     * matrix does *not* include the persistent {@link #panX}/{@link #panY}/{@link #zoomX}/{@link #zoomY}
     * transformation properties.
     * @return {Ext.draw.Matrix}
     */
    getFastTransformMatrix: function() {
        return this.fastTransformMatrix || new Ext.draw.Matrix();
    },

    /**
     * Sets the pan/zoom transformation for this chart item, using CSS3 for fast hardware-accelerated
     * transformation. The existing persistent {@link #panX}, {@link #panY}, {@link #zoomX}, and
     * {@link #zoomY} properties will be left alone and the remaining transform required to reach
     * the supplied matrix argument will be applied using a CSS3 transform.
     * @param {Ext.draw.Matrix} matrix
     */
    setTransformMatrixFast: function(matrix) {
        var parts = matrix.split();
        this.setTransformFast(parts.translateX, parts.translateY, parts.scaleX, parts.scaleY);
    },

    /**
     * @private
     * Sets only the CSS3 fast transform to match the given {@link Ext.draw.Matrix}, overwriting
     * any existing fast transform.
     * @param {Ext.draw.Matrix} matrix
     */
    setFastTransformMatrix: function(matrix) {
        var me = this;
        me.fastTransformMatrix = matrix;
        Ext.each(me.getTransformableSurfaces(), function(surface) {
            surface.setSurfaceFastTransform(matrix);
        });
        if (matrix) {
            me.fireEvent('transform', me, true);
        }
    },

    /**
     * @private
     * Removes any CSS3 fast transform currently applied to this chart item.
     */
    clearFastTransform: function() {
        this.setFastTransformMatrix(null);
    },

    /**
     * Returns `true` if this chart item currently has a CSS3 fast transform applied, `false` if not.
     * @return {Boolean}
     */
    hasFastTransform: function() {
        var matrix = this.fastTransformMatrix;
        return matrix && !matrix.isIdentity();
    },

    /**
     * Clears all transforms from this chart item.
     */
    clearTransform: function() {
        this.setTransform(0, 0, 1, 1);
    },

    /**
     * If this chart item has a CSS3 fast transform applied, this method will apply that transform
     * to the persistent {@link #panX}/{@link #panY}/{@link #zoomX}/{@link #zoomY} transform properties
     * and remove the fast transform.
     */
    syncToFastTransform: function() {
        // decompose the fast transform matrix and adjust the persistent pan/zoom by its values
        var me = this,
            fastMatrix = me.getFastTransformMatrix(),
            parts = fastMatrix.split();
        delete me.fastTransformMatrix;
        me.transformBy(parts.translateX, parts.translateY, parts.scaleX, parts.scaleY);
    },

    /**
     * Return a list of the {@link Ext.draw.Surface surfaces} that should be kept in sync
     * with this chart item's transformations.
     */
    getTransformableSurfaces: function() {
        return [];
    }

});