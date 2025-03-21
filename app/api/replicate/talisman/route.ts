import { NextResponse } from 'next/server'
import Replicate from 'replicate'
import {  IGenerateResponse, IErrorResponse } from '@/app/types'

// Replicate 클라이언트 초기화
const replicate = new Replicate({
    auth: process.env.REPLICATE_API_TOKEN
})

export async function POST(request: Request) {
    try {
        // 요청 데이터 파싱
        const { concern, userName } = await request.json()

        // 입력값 검증
        if (!concern || !userName) {
            return NextResponse.json(
                {
                    success: false,
                    error: {
                        code: 'INVALID_PROMPT',
                        message:
                            '프롬프트가 누락되었거나 길이가 초과되었습니다.'
                    }
                } as IErrorResponse,
                { status: 400 }
            )
        }

        // Replicate API 호출 시 추가 매개변수 설정
        const prediction = await replicate.predictions.create({
            model: 'black-forest-labs/flux-schnell',
            input: {
                prompt: concern,
                aspect_ratio: '1:1',
                num_outputs: 1,
                go_fast: true,
                megapixels: '1',
                output_format: 'webp',
                output_quality: 90,
                negative_prompt: 'blurry, low quality, distorted, deformed' // 품질 향상을 위한 네거티브 프롬프트 추가
            }
        })

        // 이미지 생성 상태 확인을 위한 폴링
        let finalPrediction = prediction
        let retryCount = 0
        const maxRetries = 30 // 최대 30초 대기

        while (
            finalPrediction.status !== 'succeeded' &&
            finalPrediction.status !== 'failed' &&
            retryCount < maxRetries
        ) {
            await new Promise(resolve => setTimeout(resolve, 1000))
            finalPrediction = await replicate.predictions.get(prediction.id)
            retryCount++
        }

        // 타임아웃 또는 생성 실패 시
        if (retryCount >= maxRetries || finalPrediction.status === 'failed') {
            return NextResponse.json(
                {
                    success: false,
                    error: {
                        code: 'GENERATION_FAILED',
                        message:
                            retryCount >= maxRetries
                                ? '이미지 생성 시간이 초과되었습니다.'
                                : '이미지 생성에 실패했습니다.'
                    }
                } as IErrorResponse,
                { status: 500 }
            )
        }

        // 성공 응답
        return NextResponse.json({
            success: true,
            imageUrl: finalPrediction.output[0]
        } as IGenerateResponse)
    } catch (error) {
        console.error('Image generation error:', error)
        return NextResponse.json(
            {
                success: false,
                error: {
                    code: 'GENERATION_FAILED',
                    message: '서버 오류가 발생했습니다.'
                }
            } as IErrorResponse,
            { status: 500 }
        )
    }
}
