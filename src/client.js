import Promise from 'bluebird';
import Travis  from 'travis-ci';
import _       from 'lodash';
import chalk   from 'chalk';
import config  from './config';


/**
 * @param {Mozaik} mozaik
 * @returns {Function}
 */
const client = mozaik => {
    const travis = new Travis({
        version: '2.0.0'
    });

    const travisPro = new Travis({
        version: '2.0.0',
        pro: true
    });

    mozaik.loadApiConfig(config);

    if (config.has('travis.apiToken')) {
        travisPro.authenticate({
            access_token: config.get('travis.apiToken')
        }, function (err) {
            if (err) {
                mozaik.logger.error(`[travis] ${ JSON.stringify(err) }`);
            }

            mozaik.logger.info('[travis] authenticated successfully');
        });
    }

    return {
        /**
         * Fetch repository info.
         *
         * @param {object} params
         * @param {string} params.owner
         * @param {string} params.repository
         * @param {bool} params.pro
         * @returns {Promise}
         */
        repository({ owner, repository, pro }) {
            const def = Promise.defer();

            mozaik.logger.info(chalk.yellow(`[travis] calling repository: ${owner}/${repository}`));

            let client = pro ? travisPro : travis;

            client.repos(owner, repository).get((err, res) => {
                if (err) {
                    def.reject(err);
                }

                def.resolve(res.repo);
            });

            return def.promise;
        },

        /**
         * Fetch repository build history.
         *
         * @param {object} params
         * @param {string} params.owner
         * @param {string} params.repository
         * @param {bool} params.pro
         * @returns {Promise}
         */
        buildHistory({ owner, repository, pro }) {
            const def = Promise.defer();

            mozaik.logger.info(chalk.yellow(`[travis] calling buildHistory: ${owner}/${repository}`));

            let client = pro ? travisPro : travis;

            client.repos(owner, repository).builds.get((err, res) => {
                if (err) {
                    def.reject(err);
                }

                res.builds.forEach(build => {
                    const commit = _.find(res.commits, { id: build.commit_id });
                    if (commit) {
                        build.commit = commit;
                    }
                });

                def.resolve(res.builds);
            });

            return def.promise;
        }
    };
};


export default client;
