resource "aws_cloudfront_cache_policy" "images-prod" {
  name        = "images-prod"
  default_ttl = 31536000
  max_ttl     = 31536000
  min_ttl     = 31536000

  parameters_in_cache_key_and_forwarded_to_origin {
    cookies_config {
      cookie_behavior = "none"
    }
    headers_config {
      header_behavior = "none"
    }
    query_strings_config {
      query_string_behavior = "none"
    }
    enable_accept_encoding_brotli = true
    enable_accept_encoding_gzip = true
  }
}





module "cloudfront" {
  source  = "terraform-aws-modules/cloudfront/aws"
  version = "3.2.1"

  aliases = local.aliases

  enabled             = true
  is_ipv6_enabled     = true
  price_class         = "PriceClass_100"
  retain_on_delete    = false
  create_distribution = true
  create_origin_access_control = true

  default_root_object = "index.html"
  http_version        = "http2and3"

  custom_error_response = [{
    error_code         = 404
    error_caching_min_ttl = 1
    }, {
    error_code         = 403
    error_caching_min_ttl = 1
  }, {
    error_code         = 400
    error_caching_min_ttl = 1
  }, {
    error_code         = 405
    error_caching_min_ttl = 1
  }, {
    error_code         = 414
    error_caching_min_ttl = 1
  }, {
    error_code         = 416
    error_caching_min_ttl = 1
  }, {
    error_code         = 500
    error_caching_min_ttl = 1
  }, {
    error_code         = 501
    error_caching_min_ttl = 1
  }, {
    error_code         = 502
    error_caching_min_ttl = 1
  }, {
    error_code         = 503
    error_caching_min_ttl = 1
  }, {
    error_code         = 504
    error_caching_min_ttl = 1
  }]


  origin_access_control = {
    s3_oac = {
      description      = "CloudFront access to S3"
      origin_type      = "s3"
      signing_behavior = "always"
      signing_protocol = "sigv4"
    }
  }

 origin = {
    s3_oac = { 
      domain_name           = local.bucket_url
      origin_access_control = "s3_oac"
    }
  }

  default_cache_behavior = {
    target_origin_id           = "s3_oac"
    viewer_protocol_policy     = "redirect-to-https"

    allowed_methods = ["GET", "HEAD", "OPTIONS"]
    cached_methods  = ["GET", "HEAD"]
    compress        = true
    query_string    = false

    
    function_association = {
    viewer-request = {
        function_arn = aws_cloudfront_function.redirect-index.arn
    }
    }
  }

    ordered_cache_behavior = [
    {
      use_forwarded_values = false
      path_pattern           = "*.png"
      target_origin_id       = "s3_oac"
      viewer_protocol_policy = "redirect-to-https"

      allowed_methods = ["GET", "HEAD", "OPTIONS"]
      cached_methods  = ["GET", "HEAD"]
      compress        = true
      origin_request_policy_id = "88a5eaf4-2fd4-4709-b370-b4c650ea3fcf"
      cache_policy_id = aws_cloudfront_cache_policy.images-prod.id

    },
    {
      use_forwarded_values = false
      path_pattern           = "*.jpg"
      target_origin_id       = "s3_oac"
      viewer_protocol_policy = "redirect-to-https"

      allowed_methods = ["GET", "HEAD", "OPTIONS"]
      cached_methods  = ["GET", "HEAD"]
      compress        = true
      origin_request_policy_id = "88a5eaf4-2fd4-4709-b370-b4c650ea3fcf"
      cache_policy_id = aws_cloudfront_cache_policy.images-prod.id

    },
    {
      use_forwarded_values = false
      path_pattern           = "*.webp"
      target_origin_id       = "s3_oac"
      viewer_protocol_policy = "redirect-to-https"

      allowed_methods = ["GET", "HEAD", "OPTIONS"]
      cached_methods  = ["GET", "HEAD"]
      compress        = true
      origin_request_policy_id = "88a5eaf4-2fd4-4709-b370-b4c650ea3fcf"
      cache_policy_id = aws_cloudfront_cache_policy.images-prod.id

    },
    {
      use_forwarded_values = false
      path_pattern           = "*.js"
      target_origin_id       = "s3_oac"
      viewer_protocol_policy = "redirect-to-https"

      allowed_methods = ["GET", "HEAD", "OPTIONS"]
      cached_methods  = ["GET", "HEAD"]
      compress        = true
      origin_request_policy_id = "88a5eaf4-2fd4-4709-b370-b4c650ea3fcf"
      cache_policy_id = "658327ea-f89d-4fab-a63d-7e88639e58f6"

    },
    {
      use_forwarded_values = false
      path_pattern           = "*.css"
      target_origin_id       = "s3_oac"
      viewer_protocol_policy = "redirect-to-https"

      allowed_methods = ["GET", "HEAD", "OPTIONS"]
      cached_methods  = ["GET", "HEAD"]
      compress        = true
      origin_request_policy_id = "88a5eaf4-2fd4-4709-b370-b4c650ea3fcf"
      cache_policy_id = "658327ea-f89d-4fab-a63d-7e88639e58f6"

    },
    {
      use_forwarded_values = false
      path_pattern           = "*.json"
      target_origin_id       = "s3_oac"
      viewer_protocol_policy = "redirect-to-https"

      allowed_methods = ["GET", "HEAD", "OPTIONS"]
      cached_methods  = ["GET", "HEAD"]
      compress        = true
      origin_request_policy_id = "88a5eaf4-2fd4-4709-b370-b4c650ea3fcf"
      cache_policy_id = "658327ea-f89d-4fab-a63d-7e88639e58f6"

    }
  ]

  viewer_certificate = {
    acm_certificate_arn = module.acm.acm_certificate_arn
    ssl_support_method  = "sni-only"
  }
}