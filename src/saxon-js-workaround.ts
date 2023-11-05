// This module contains components for a workaround for https://saxonica.plan.io/issues/6233

/**
 * A SaxonJSLike object is one that acts like the duck SaxonJS from
 * saxon-js npm package.
 */
export interface SaxonJSLike {

    /*
     * See <a
     * href="https://www.saxonica.com/saxon-js/documentation2/index.html#!api/transform">https://www.saxonica.com/saxon-js/documentation2/index.html#!api/transform</a>
     */
    transform(options: { [key: string]: any }): Promise<any>;

}
