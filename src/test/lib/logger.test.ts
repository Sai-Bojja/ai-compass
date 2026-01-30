import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { logger } from "@/lib/logger";

// =====================================================
// LOGGER UTILITY TESTS
// =====================================================

describe("logger", () => {
    let consoleSpy: {
        debug: ReturnType<typeof vi.spyOn>;
        info: ReturnType<typeof vi.spyOn>;
        warn: ReturnType<typeof vi.spyOn>;
        error: ReturnType<typeof vi.spyOn>;
        group: ReturnType<typeof vi.spyOn>;
        groupEnd: ReturnType<typeof vi.spyOn>;
        time: ReturnType<typeof vi.spyOn>;
        timeEnd: ReturnType<typeof vi.spyOn>;
    };

    beforeEach(() => {
        consoleSpy = {
            debug: vi.spyOn(console, "debug").mockImplementation(() => { }),
            info: vi.spyOn(console, "info").mockImplementation(() => { }),
            warn: vi.spyOn(console, "warn").mockImplementation(() => { }),
            error: vi.spyOn(console, "error").mockImplementation(() => { }),
            group: vi.spyOn(console, "group").mockImplementation(() => { }),
            groupEnd: vi.spyOn(console, "groupEnd").mockImplementation(() => { }),
            time: vi.spyOn(console, "time").mockImplementation(() => { }),
            timeEnd: vi.spyOn(console, "timeEnd").mockImplementation(() => { }),
        };
    });

    afterEach(() => {
        vi.restoreAllMocks();
    });

    describe("debug", () => {
        it("logs debug messages with metadata", () => {
            logger.debug("Test debug message", { key: "value" });
            expect(consoleSpy.debug).toHaveBeenCalled();
        });
    });

    describe("info", () => {
        it("logs info messages", () => {
            logger.info("Test info message");
            expect(consoleSpy.info).toHaveBeenCalled();
        });

        it("includes metadata in output", () => {
            logger.info("Info with meta", { userId: "123" });
            expect(consoleSpy.info).toHaveBeenCalled();
        });
    });

    describe("warn", () => {
        it("logs warning messages", () => {
            logger.warn("Test warning");
            expect(consoleSpy.warn).toHaveBeenCalled();
        });
    });

    describe("error", () => {
        it("logs error messages", () => {
            logger.error("Test error");
            expect(consoleSpy.error).toHaveBeenCalled();
        });

        it("handles Error objects", () => {
            const error = new Error("Test error");
            logger.error("Something failed", error);
            expect(consoleSpy.error).toHaveBeenCalled();
        });

        it("handles non-Error objects", () => {
            logger.error("Unknown error", { code: 500 });
            expect(consoleSpy.error).toHaveBeenCalled();
        });
    });

    describe("group/groupEnd", () => {
        it("groups logs together", () => {
            logger.group("Test Group");
            logger.info("Nested log");
            logger.groupEnd();
            expect(consoleSpy.group).toHaveBeenCalledWith("Test Group");
            expect(consoleSpy.groupEnd).toHaveBeenCalled();
        });
    });

    describe("time/timeEnd", () => {
        it("times operations", () => {
            logger.time("test-timer");
            logger.timeEnd("test-timer");
            expect(consoleSpy.time).toHaveBeenCalledWith("test-timer");
            expect(consoleSpy.timeEnd).toHaveBeenCalledWith("test-timer");
        });
    });
});
