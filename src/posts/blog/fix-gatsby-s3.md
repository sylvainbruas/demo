---
title: "Optimiser le comportement d'Amazon Cloudfront pour des sites web via des Cloudfront Fonctions (application avec Gatsby)"
category: "Tech"
date: "2023-10-10 12:00:00 +01:00"
desc: "La redirection des URLS finissant par '/' vers index.html ne fonctionne partiellement. Ceci peut être corrigé avec Lambda@Edge ou CloudFront Functions"
thumbnail: "./images/EKS-ip/k8S.webp"
alt: "Amazon Cloudfront et Gatsby"
tags: 
- AWS
- Gatsby
- Amazon Cloudfront
- AWS Lambda@Edge
- Amazon S3
author: "Sylvain BRUAS"
intro: "La redirection des URLS finissant par '/' vers index.html ne fonctionne que partiellement. Ceci peut être corrigé avec Lambda@Edge ou CloudFront Functions"
published: "hidden"
lang: "french"
---
[Gatsby](https://www.gatsbyjs.com/) est un outil permettant de créer rapidement des sites webs en utilisant le langage [React](https://react.dev/),  du javascript ou le langage [TypeScript](https://www.typescriptlang.org/).

Cet outil permet de facilement déployer le site sur Amazon S3 et d'ainsi réduire la complexité de maintenance et les coûts. Pour assurer une distribution du contenu rapide et efficace, nous utilisons Amazon Cloudfront.
![User request flow](images/resume-challenge/sylvain.bruas.fr.png)


## Installer le plugin Gatsby S3 

```shell
  > yarn add gatsby-plugin-s3
ou 
  > npm install gatsby-plugin-s3

```

## Modifier gatsby-config.js

Il faut ajouter la configuration du plugin dans ce fichier. Il est nécessaire de préciser à minima le bucket de destination.

```javascript{3,5}
    plugins: [
      {
        resolve: `gatsby-plugin-s3`,
        options: {
        bucketName: "myBucket",
        },
      },
    ]
``````

## Problème identifié

Si nous tentons de nous connecter directement sur une page autre que la page d'accueil, nous obtenons le résultat suivant : 
```sh{6}
wget https://sylvain.bruas.fr/blog/aws-eks-contrainte-ip/                      
--2023-10-30 15:18:32--  https://sylvain.bruas.fr/blog/aws-eks-contrainte-ip/
Résolution de sylvain.bruas.fr (sylvain.bruas.fr)… 52.222.144.106, 52.222.144.45, 52.222.144.68, ...
Connexion à sylvain.bruas.fr (sylvain.bruas.fr)|52.222.144.106|:443… connecté.
requête HTTP transmise, en attente de la réponse… 403 Forbidden
2023-10-30 15:18:32 erreur 403 : Forbidden.
```
&nbsp;



La solution proposée par [Gatsby](https://www.gatsbyjs.com/docs/how-to/previews-deploys-hosting/deploying-to-s3-cloudfront/#setting-up-cloudfront) est d'utiliser S3 avec l'option Static Website Hosting et configurer le bucket en public-read.
Dans cette configuration, le bucket peut être accédé directement, en HTTP si l'on trouve son URL.

Une autre solution est disponible depuis la mise en place des Lambda@Edge (2016) et des Cloudfront functions (2021).
En utilisant l'un de ces deux outils, nous pouvons manipuler la requête HTTP entrante, et si l'on identifie une URL terminant par un slash (/) ou qui ne contient pas d'extension nous ajoutons à la fin '/index.html'.

## Lambda@edge et Cloudfront Functions

Nous allons donc déployer le code suivant, tiré de la [documentation AWS](https://docs.aws.amazon.com/AmazonCloudFront/latest/DeveloperGuide/example-function-add-index.html).

```js
function handler(event) {
    var request = event.request;
    var uri = request.uri;
    
    // Check whether the URI is missing a file name.
    if (uri.endsWith('/')) {
        request.uri += 'index.html';
    } 
    // Check whether the URI is missing a file extension.
    else if (!uri.includes('.')) {
        request.uri += '/index.html';
    }

    return request;
}
```
&nbsp;

Il ne reste plus qu'à choisir entre Lambda@Edge et Cloudfront Functions.
L'[article](https://aws.amazon.com/fr/blogs/aws/introducing-cloudfront-functions-run-your-code-at-the-edge-with-low-latency-at-any-scale/) annoncant la mise à disposition de Cloudfront fonction nous renseigne clairement sur les différences principales entre ces 2 services.

|   |  **_CloudFront Functions_** | **_Lambda@Edge_**  |
|---|:---------------------------:|:------------------:|
|  Runtime support |  JavaScript | Node.js, Python  | 
|  Execution location |  Edge Locations (~220)  |  Regional Edge Caches (~10) |
|  CloudFront triggers supported | Viewer request, Viewer response  | Viewer request,Viewer response,Origin request, Origin response  |
| Maximum execution time  |  1 millisecond  | 5 seconds (viewer triggers) |
| Total package size  | 10 KB  |  1 MB (viewer triggers) |
|  Maximum memory | 2MB  | 128MB (viewer triggers) |
|  Network access |  No | Yes  |
|  File system access |  No |  Yes |
| Access to the request body  | No  | Yes  |
|  Pricing | Free Tier* +  $0.10 per 1 million invocations | $0.60 per 1M requests + $0.00005001 for every GB-second  |

Free Tier pour CloudFront Functions : 2,000,000 Invocations

Notre fonction javascript est très simple et légère. Elle s'exécute rapidement et ne consomme que de la mémoire, et en quantité limitée. Notre fonctionnalité peut donc être déployée sur les 2 services. 
C'est donc l'aspect financier qui va faire la différence. 

Que ce soit pour les petits sites qui profiterons de l'offre gratuite, ou le prix à la requête pour les sites ayant un grand nombre de visite, Amazon Cloudfront Functions reste la solution la plus efficiente économiquement. 

La suite de l'article et les exemples proposés se concentreront donc sur Amazon Cloudfront Functions.

Nous allons utiliser [Terraform](https://www.terraform.io/) pour déployer notre fonction.

## Déploiement de la solution 

1. Nous créons un fichier index.js dans le chemin functions/cloudfront du projet.
```js
function handler(event) {
    var request = event.request;
    var uri = request.uri;
    
    // Check whether the URI is missing a file name.
    if (uri.endsWith('/')) {
        request.uri += 'index.html';
    } 
    // Check whether the URI is missing a file extension.
    else if (!uri.includes('.')) {
        request.uri += '/index.html';
    }

    return request;
}
```

&nbsp;

1. Nous ajoutons dans le répertoire iac un nouveau fichier appelé cloudfront_functions.tf. 
Voici son contenu : 
```hcl{3,5,6}
resource "aws_cloudfront_function" "redirect-index" {
  name    = "redirect-index"
  runtime = "cloudfront-js-1.0"
  comment = "add missing index.html at the end of url"
  publish = true
  code    = file("../functions/cloudfront/index.js")
}
```

Il faut bien veiller à préciser le moteur (runtime) à utiliser, publier la fonction et modifier si nécessaire le chemin vers notre code.

&nbsp; 

3. Ajouter le code suivant dans la définition terraform de votre distribution cloudfront, dans la section  default_cache_behavior 
```hcl{2-6}
default_cache_behavior = {  
    function_association = {
      viewer-request = {
          function_arn = aws_cloudfront_function.redirect-index.arn
      }
    }

    ...
```
&nbsp;

4. terraform plan

```sh
...

Terraform used the selected providers to generate the following execution plan. Resource actions are indicated
with the following symbols:
  + create

Terraform will perform the following actions:

  # aws_cloudfront_function.redirect-index will be created
  + resource "aws_cloudfront_function" "redirect-index" {
      + arn             = (known after apply)
      + code            = <<-EOT
            function handler(event) {
                var request = event.request;
                var uri = request.uri;
                
                // Check whether the URI is missing a file name.
                if (uri.endsWith('/')) {
                    request.uri += 'index.html';
                } 
                // Check whether the URI is missing a file extension.
                else if (!uri.includes('.')) {
                    request.uri += '/index.html';
                }
            
                return request;
            }
        EOT
      + comment         = "add missing index.html at the end of url"
      + etag            = (known after apply)
      + id              = (known after apply)
      + live_stage_etag = (known after apply)
      + name            = "redirect-index"
      + publish         = true
      + runtime         = "cloudfront-js-1.0"
      + status          = (known after apply)
    }

Plan: 1 to add, 0 to change, 0 to destroy.
```
&nbsp;

5. Terraform apply

L'affichage sera le même qu'à l'étape précédente. Une invite va apparaitre pour vous demander de valider que vous êtes prêt à appliquer ces modifications. Après quelques minutes d'attente, la fonction sera déployée.

6. Résultats

Avant la mise en place de la focntion, nous obtenions le résultat suivant, une erreur 403 : 

```sh{6}
wget https://sylvain.bruas.fr/blog/aws-eks-contrainte-ip/                      
--2023-10-30 15:18:32--  https://sylvain.bruas.fr/blog/aws-eks-contrainte-ip/
Résolution de sylvain.bruas.fr (sylvain.bruas.fr)… 52.222.144.106, 52.222.144.45, 52.222.144.68, ...
Connexion à sylvain.bruas.fr (sylvain.bruas.fr)|52.222.144.106|:443… connecté.
requête HTTP transmise, en attente de la réponse… 403 Forbidden
2023-10-30 15:18:32 erreur 403 : Forbidden.
```
&nbsp;

Avec la fonction Cloudfront nous obtenons : 

```sh{5}
wget https://sylvain.bruas.fr/blog/aws-eks-contrainte-ip/                     
--2023-10-30 15:46:41--  https://sylvain.bruas.fr/blog/aws-eks-contrainte-ip/
Résolution de sylvain.bruas.fr (sylvain.bruas.fr)… 52.222.144.68, 52.222.144.56, 52.222.144.45, ...
Connexion à sylvain.bruas.fr (sylvain.bruas.fr)|52.222.144.68|:443… connecté.
requête HTTP transmise, en attente de la réponse… 200 OK
Taille : 108929 (106K) [text/html]
Sauvegarde en : « index.html »

index.html                 100%[=============================================>] 106,38K  --.-KB/s    ds 0,06s   

2023-10-30 15:46:42 (1,72 MB/s) — « index.html » sauvegardé [108929/108929]
```
&nbsp;

La requête est donc traitée ainsi : 


![User request flow](images/cloudfront_functions.png)