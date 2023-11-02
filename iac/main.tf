terraform {

  ###### Global Config  ######
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.14.0"
    }
  }
}



data "aws_caller_identity" "current" {}

data "aws_canonical_user_id" "current" {}


provider "aws" {
  region = local.region
  profile = local.profile

  # Make it faster by skipping something
  skip_metadata_api_check     = true
  skip_region_validation      = true
  skip_credentials_validation = true
}

provider "aws" {
  alias  = "us-east-1"
  region = "us-east-1"
  profile = local.profile

  # Make it faster by skipping something
  skip_metadata_api_check     = true
  skip_region_validation      = true
  skip_credentials_validation = true
}

module "s3" {
  source   = "terraform-aws-modules/s3-bucket/aws"
  version  = "3.15.1"

  block_public_acls = true
  block_public_policy = true
  ignore_public_acls = true
  restrict_public_buckets = true

  bucket = local.bucket_name

  force_destroy = true
  
  server_side_encryption_configuration = {
    rule = {
      apply_server_side_encryption_by_default = {
        sse_algorithm     = "AES256"
      }
    }
  }

  tags = {
    Environment = local.tag_env
  }
}




data "aws_route53_zone" "this" {
  name = local.domain_name
}



module "acm" {
  source  = "terraform-aws-modules/acm/aws"
  version = "4.4.0"

  providers = {
    aws = aws.us-east-1
  }

  domain_name               = "${local.subdomain}.${local.domain_name}"
  zone_id                   = data.aws_route53_zone.this.id


  validation_method = "DNS"

}


module "records" {
  source  = "terraform-aws-modules/route53/aws//modules/records"
  version = "2.10.2"

  zone_id = data.aws_route53_zone.this.id

  records = [
    {
      name = local.subdomain
      type = "A"
      alias = {
        name    = module.cloudfront.cloudfront_distribution_domain_name
        zone_id = module.cloudfront.cloudfront_distribution_hosted_zone_id
      }
    },
  ]
}


data "aws_iam_policy_document" "s3_policy" {
  # Origin Access Controls
  statement {
    actions   = ["s3:GetObject"]
    resources = ["${module.s3.s3_bucket_arn}/*"]

    principals {
      type        = "Service"
      identifiers = ["cloudfront.amazonaws.com"]
    }

    condition {
      test     = "StringEquals"
      variable = "aws:SourceArn"
      values   = [module.cloudfront.cloudfront_distribution_arn]
    }
  }
}

resource "aws_s3_bucket_policy" "bucket_policy" {
  bucket = module.s3.s3_bucket_id
  policy = data.aws_iam_policy_document.s3_policy.json
}