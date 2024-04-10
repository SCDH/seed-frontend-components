import anylogger from "anylogger";

/*
 * We are using a logging facade throughout the library. Thus, the app
 * developper can use whatever logging implementation she wants.
 *
 * See https://www.npmjs.com/package/anylogger
 */
const log = anylogger("seed-frontend-components/components");

export default log;
