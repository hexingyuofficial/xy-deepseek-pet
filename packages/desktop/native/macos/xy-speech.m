#import <Foundation/Foundation.h>
#import <Speech/Speech.h>
#include <sys/stat.h>

static NSString *resultPath = nil;

static BOOL waitForSignal(dispatch_semaphore_t semaphore, NSTimeInterval timeout) {
  NSDate *deadline = [NSDate dateWithTimeIntervalSinceNow:timeout];
  while (dispatch_semaphore_wait(semaphore, DISPATCH_TIME_NOW) != 0) {
    if (deadline.timeIntervalSinceNow <= 0) return NO;
    [[NSRunLoop currentRunLoop] runMode:NSDefaultRunLoopMode
                             beforeDate:[NSDate dateWithTimeIntervalSinceNow:0.05]];
  }
  return YES;
}

static void printResult(NSDictionary *value) {
  NSData *data = [NSJSONSerialization dataWithJSONObject:value options:0 error:nil];
  if (resultPath) {
    [data writeToFile:resultPath options:NSDataWritingAtomic error:nil];
    chmod(resultPath.fileSystemRepresentation, S_IRUSR | S_IWUSR);
    return;
  }
  fwrite(data.bytes, 1, data.length, stdout);
  fputc('\n', stdout);
  fflush(stdout);
}

int main(int argc, const char *argv[]) {
  @autoreleasepool {
    if (argc != 4) {
      printResult(@{ @"ok": @NO, @"error": @"Invalid speech helper arguments." });
      return 2;
    }
    NSString *audioPath = [NSString stringWithUTF8String:argv[1]];
    NSString *language = [NSString stringWithUTF8String:argv[2]];
    resultPath = [NSString stringWithUTF8String:argv[3]];
    dispatch_semaphore_t authorization = dispatch_semaphore_create(0);
    __block SFSpeechRecognizerAuthorizationStatus status = SFSpeechRecognizerAuthorizationStatusNotDetermined;
    [SFSpeechRecognizer requestAuthorization:^(SFSpeechRecognizerAuthorizationStatus value) {
      status = value;
      dispatch_semaphore_signal(authorization);
    }];
    if (!waitForSignal(authorization, 30) || status != SFSpeechRecognizerAuthorizationStatusAuthorized) {
      printResult(@{ @"ok": @NO, @"error": @"macOS speech recognition permission was not granted." });
      return 2;
    }

    NSLocale *locale = [language isEqualToString:@"system"] ? nil : [[NSLocale alloc] initWithLocaleIdentifier:language];
    SFSpeechRecognizer *recognizer = locale ? [[SFSpeechRecognizer alloc] initWithLocale:locale] : [[SFSpeechRecognizer alloc] init];
    if (!recognizer || !recognizer.available) {
      printResult(@{ @"ok": @NO, @"error": @"macOS speech recognition is unavailable for the selected language." });
      return 2;
    }

    SFSpeechURLRecognitionRequest *request = [[SFSpeechURLRecognitionRequest alloc] initWithURL:[NSURL fileURLWithPath:audioPath]];
    request.shouldReportPartialResults = NO;
    dispatch_semaphore_t completion = dispatch_semaphore_create(0);
    __block NSString *text = @"";
    __block NSString *failure = nil;
    __block BOOL finished = NO;
    SFSpeechRecognitionTask *task = [recognizer recognitionTaskWithRequest:request resultHandler:^(SFSpeechRecognitionResult *result, NSError *error) {
      if (result) text = result.bestTranscription.formattedString ?: @"";
      if (error) failure = error.localizedDescription;
      if (!finished && (result.isFinal || error)) {
        finished = YES;
        dispatch_semaphore_signal(completion);
      }
    }];
    if (!waitForSignal(completion, 75)) {
      [task cancel];
      printResult(@{ @"ok": @NO, @"error": @"macOS speech recognition timed out." });
      return 2;
    }
    if (failure) {
      printResult(@{ @"ok": @NO, @"error": failure });
      return 2;
    }
    printResult(@{ @"ok": @YES, @"text": text ?: @"" });
    return 0;
  }
}
