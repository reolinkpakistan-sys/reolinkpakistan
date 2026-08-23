#import <Foundation/Foundation.h>
#import <AVFoundation/AVFoundation.h>

int main(int argc, const char * argv[]) {
    @autoreleasepool {
        NSString *videoPath = @"/Users/MAC/Desktop/Jzones V630 4K.MP4";
        NSString *audioPath = @"videos/jzones_bg_music.m4a";
        NSString *outputPath = @"videos/jzones_v630_dha_sample_web.mp4";

        NSURL *videoURL = [NSURL fileURLWithPath:videoPath];
        NSURL *audioURL = [NSURL fileURLWithPath:audioPath];
        NSURL *outputURL = [NSURL fileURLWithPath:outputPath];

        [[NSFileManager defaultManager] removeItemAtURL:outputURL error:nil];

        AVAsset *videoAsset = [AVAsset assetWithURL:videoURL];
        AVAsset *audioAsset = [AVAsset assetWithURL:audioURL];

        NSError *error = nil;
        AVAssetReader *videoReader = [[AVAssetReader alloc] initWithAsset:videoAsset error:&error];
        AVAssetReader *audioReader = [[AVAssetReader alloc] initWithAsset:audioAsset error:&error];

        AVAssetTrack *videoTrack = [videoAsset tracksWithMediaType:AVMediaTypeVideo].firstObject;
        AVAssetTrack *audioTrack = [audioAsset tracksWithMediaType:AVMediaTypeAudio].firstObject;

        NSDictionary *videoReaderSettings = @{ (id)kCVPixelBufferPixelFormatTypeKey: @(kCVPixelFormatType_32BGRA) };
        AVAssetReaderTrackOutput *videoOutput = [[AVAssetReaderTrackOutput alloc] initWithTrack:videoTrack outputSettings:videoReaderSettings];
        [videoReader addOutput:videoOutput];

        NSDictionary *audioReaderSettings = @{ AVFormatIDKey: @(kAudioFormatLinearPCM) };
        AVAssetReaderTrackOutput *audioOutput = [[AVAssetReaderTrackOutput alloc] initWithTrack:audioTrack outputSettings:audioReaderSettings];
        [audioReader addOutput:audioOutput];

        AVAssetWriter *writer = [[AVAssetWriter alloc] initWithURL:outputURL fileType:AVFileTypeMPEG4 error:&error];
        writer.shouldOptimizeForNetworkUse = YES;

        // Video Settings: 1920x1080 Full HD with 3.8 Mbps H.264 High Profile (Ultra Crisp & Instant Start)
        NSDictionary *videoCompressionProps = @{
            AVVideoAverageBitRateKey: @(3800000),
            AVVideoProfileLevelKey: AVVideoProfileLevelH264HighAutoLevel,
            AVVideoMaxKeyFrameIntervalKey: @(25), // 1 keyframe every second for instant decoding
            AVVideoAllowFrameReorderingKey: @(YES)
        };

        NSDictionary *videoWriterSettings = @{
            AVVideoCodecKey: AVVideoCodecTypeH264,
            AVVideoWidthKey: @(1920),
            AVVideoHeightKey: @(1080),
            AVVideoCompressionPropertiesKey: videoCompressionProps
        };

        AVAssetWriterInput *videoWriterInput = [[AVAssetWriterInput alloc] initWithMediaType:AVMediaTypeVideo outputSettings:videoWriterSettings];
        videoWriterInput.expectsMediaDataInRealTime = NO;
        [writer addInput:videoWriterInput];

        // Audio Settings: High Quality AAC Stereo 160 kbps
        AudioChannelLayout layout;
        memset(&layout, 0, sizeof(layout));
        layout.mChannelLayoutTag = kAudioChannelLayoutTag_Stereo;

        NSDictionary *audioWriterSettings = @{
            AVFormatIDKey: @(kAudioFormatMPEG4AAC),
            AVNumberOfChannelsKey: @(2),
            AVSampleRateKey: @(44100.0),
            AVEncoderBitRateKey: @(160000),
            AVChannelLayoutKey: [NSData dataWithBytes:&layout length:sizeof(layout)]
        };

        AVAssetWriterInput *audioWriterInput = [[AVAssetWriterInput alloc] initWithMediaType:AVMediaTypeAudio outputSettings:audioWriterSettings];
        audioWriterInput.expectsMediaDataInRealTime = NO;
        [writer addInput:audioWriterInput];

        [writer startWriting];
        [videoReader startReading];
        [audioReader startReading];
        [writer startSessionAtSourceTime:kCMTimeZero];

        dispatch_queue_t vQueue = dispatch_queue_create("vQueue", NULL);
        dispatch_queue_t aQueue = dispatch_queue_create("aQueue", NULL);
        dispatch_group_t group = dispatch_group_create();

        dispatch_group_enter(group);
        [videoWriterInput requestMediaDataWhenReadyOnQueue:vQueue usingBlock:^{
            while ([videoWriterInput isReadyForMoreMediaData]) {
                CMSampleBufferRef sample = [videoOutput copyNextSampleBuffer];
                if (sample) {
                    [videoWriterInput appendSampleBuffer:sample];
                    CFRelease(sample);
                } else {
                    [videoWriterInput markAsFinished];
                    dispatch_group_leave(group);
                    break;
                }
            }
        }];

        dispatch_group_enter(group);
        [audioWriterInput requestMediaDataWhenReadyOnQueue:aQueue usingBlock:^{
            while ([audioWriterInput isReadyForMoreMediaData]) {
                CMSampleBufferRef sample = [audioOutput copyNextSampleBuffer];
                if (sample) {
                    [audioWriterInput appendSampleBuffer:sample];
                    CFRelease(sample);
                } else {
                    [audioWriterInput markAsFinished];
                    dispatch_group_leave(group);
                    break;
                }
            }
        }];

        dispatch_group_wait(group, DISPATCH_TIME_FOREVER);

        dispatch_semaphore_t sem = dispatch_semaphore_create(0);
        [writer finishWritingWithCompletionHandler:^{
            if (writer.status == AVAssetWriterStatusCompleted) {
                NSLog(@"Successfully encoded 2.5K FastStart video!");
            } else {
                NSLog(@"Encoding failed: %@", writer.error);
            }
            dispatch_semaphore_signal(sem);
        }];
        dispatch_semaphore_wait(sem, DISPATCH_TIME_FOREVER);
    }
    return 0;
}
