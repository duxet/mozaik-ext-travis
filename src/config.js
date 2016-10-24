import convict from 'convict';


const config = convict({
    travis: {
        apiToken: {
            doc:     'Travis-CI Pro API auth token',
            default: '',
            format:  String,
            env:     'TRAVIS_API_TOKEN'
        }
    }
});


export default config;
