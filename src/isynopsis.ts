/**
 * Common interface of components that need to communicate in a
 * synoptic arrangement of documents (or views on the same document,
 * e.g. text and image).
 *
 * Each web component similar to `<seed-synopsis-text>` has to
 * implement this in order to get sync scroll information.
 */
export interface SeedSynopsisSyncComponent {

    /**
     * The `syncTarget` property must be a reactive property. It is set
     * by the synopsis container in order to pass information up to
     * its child elements following the "properties down" principle.
     *
     * @type {IContentMeta}
     */
    syncTarget: IContentMeta;

}

/**
 * `IContentMeta` is the payload of messages posted from iframes to the
 * main window and the payload of events bubbling up the element hierarchy
 *  and of objects passed down to the `syncTarget` property of
 * {@link SeedSynopsisSyncComponent} elements.
 *
 */
export interface IContentMeta {

    /**
     * The URL of the document loaded into a synopsis element. This is
     * commonly obtained by `window.location.href`.
     *
     * @type string
     */
    href: string;

    /**
     * The identifier of the block element that is visible on top of
     * the view port, i.e., the element scrolled to.
     *
     * @type string
     */
    top?: string;

}
