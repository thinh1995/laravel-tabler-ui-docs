def buildDockerImage() {
    sh 'docker build . -f ${DOCKER_FILE} -t ${DOCKER_HUB}/${IMAGE_NAME}:${BUILD_NUMBER}'
}

def pushDockerImage() {
    sh 'echo $dockerhub_PSW | docker login -u $dockerhub_USR --password-stdin'

    sh 'docker image tag ${DOCKER_HUB}/${IMAGE_NAME}:${BUILD_NUMBER} ${DOCKER_HUB}/${IMAGE_NAME}:${IMAGE_TAG}'
    sh 'docker push ${DOCKER_HUB}/${IMAGE_NAME}:${IMAGE_TAG}'
}

def cleanUpDocker() {
    def oldImageID = sh(script: "docker images -q  ${DOCKER_HUB}/${IMAGE_NAME}:${BUILD_NUMBER}", returnStdout: true)

    if ("${oldImageID}" != '' ) {
        sh 'docker rmi ${DOCKER_HUB}/${IMAGE_NAME}:${BUILD_NUMBER}'
    }

    def currentImageID = sh(script: "docker images -q ${DOCKER_HUB}/${IMAGE_NAME}:${IMAGE_TAG}", returnStdout: true)

    if ("${currentImageID}" != '' ) {
        sh 'docker rmi ${DOCKER_HUB}/${IMAGE_NAME}:${IMAGE_TAG}'
    }

    sh 'docker system prune -f'
}

def repositoryUrl = scm.getUserRemoteConfigs()[0].getUrl()

pipeline {
    agent {
        label 'ssh-agent'
    }

    options {
        timeout(time: 10, unit: 'MINUTES')
    }

    environment {
        DOCKER_HUB = 'thinh1995'
        IMAGE_NAME = 'laravel-tabler-ui'

        IMAGE_TAG = 'latest'
        DOCKER_FILE = 'Dockerfile'

        IP_PROXY = credentials('ip-ovhcloud-proxy')
        SSH_PORT_PROXY = credentials('ssh-port-ovhcloud-proxy')

        dockerhub = credentials('dockerhub')
        buildUrl = java.net.URLEncoder.encode(BUILD_URL, "UTF-8").replace("+", "%20")
    }

     stages {
        stage('Inform') {
            steps {
                withCredentials(([string(credentialsId: 'telegram_bot_token_mollibox', variable: 'TOKEN'),
                    string(credentialsId: 'telegram_chat_id_mollibox', variable: 'CHAT_ID')])) {
                        sh 'curl -X POST https://api.telegram.org/bot${TOKEN}/sendMessage -d "chat_id=${CHAT_ID}" -d text="[JENKINS]\nProject: ${JOB_NAME}\nBuild Number: ${BUILD_NUMBER}\nStatus: [🔔] Started\nLink: ${buildUrl}"'
                }
            }
        }

        stage('Get latest code') {
            when {
                changeRequest()
            }
            steps {
                script {
                    echo "PR Number: ${pullRequest.number}"
                    echo "PR State ${pullRequest.state}"
                    echo "PR Target Branch ${pullRequest.base}"
                    echo "PR Source Branch ${pullRequest.headRef}"
                    echo "PR Can Merge ? ${pullRequest.mergeable}"

                    if (!pullRequest.mergeable) {
                        throw new Exception("PR has conflicting files!")
                    }

                    git([branches: [[name: 'refs/heads/*:refs/remotes/origin/*']],
                         credentialsId: 'github_app_jenkins',
                         url: repositoryUrl])
                    sh "git checkout origin/${pullRequest.base}"
                    sh "git merge --no-edit origin/${pullRequest.headRef}"
                }
            }
        }

        stage ('Buid Docker Image') {
            when {
                anyOf{
                    changeRequest();
                    branch 'master';
                }
            }
            steps {
                buildDockerImage()
            }
        }

        stage('Deploy Master') {
            when {
                branch 'master'
            }
            steps {
                pushDockerImage()
                sshagent(credentials: ['ovhcloud-proxy']) {
                    sh "ssh -o StrictHostKeyChecking=no -l ubuntu ${IP_PROXY} -p ${SSH_PORT_PROXY} 'cd /home/ubuntu/services/websites/laravel-tabler-ui && \
                    ./dockerctl update'"
                }
            }
        }
    }

    post {
        always {
            script {
                cleanUpDocker()
            }

            cleanWs()
        }

        success {
            withCredentials(([string(credentialsId: 'telegram_bot_token_mollibox', variable: 'TOKEN'),
                string(credentialsId: 'telegram_chat_id_mollibox', variable: 'CHAT_ID')])) {
                    sh 'curl -X POST https://api.telegram.org/bot${TOKEN}/sendMessage -d "chat_id=${CHAT_ID}" -d text="[JENKINS]\nProject: ${JOB_NAME}\nBuild Number: ${BUILD_NUMBER}\nStatus:[✅] Success\nLink: ${buildUrl}"'
            }
        }

        failure {
            withCredentials(([string(credentialsId: 'telegram_bot_token_mollibox', variable: 'TOKEN'),
                string(credentialsId: 'telegram_chat_id_mollibox', variable: 'CHAT_ID')])) {
                    sh 'curl -X POST https://api.telegram.org/bot${TOKEN}/sendMessage -d "chat_id=${CHAT_ID}" -d text="[JENKINS]\nProject: ${JOB_NAME}\nBuild Number: ${BUILD_NUMBER}\nStatus:[❌] Failed\nLink: ${buildUrl}"'
            }
        }
    }
}
