package com.example.demo.controller;

import com.example.demo.service.PaymentService;
import com.example.demo.service.ResumeService;
import com.example.demo.service.UserService;
import com.example.demo.service.razorpay.RazorpayService;
import org.junit.jupiter.api.Test;

import java.util.Map;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

public class PaymentControllerWebhookTest {

    @Test
    void razorpayWebhook_verifiesSignatureAndMarksCompleted_direct() throws Exception {
        PaymentService paymentService = mock(PaymentService.class);
        ResumeService resumeService = mock(ResumeService.class);
        UserService userService = mock(UserService.class);
        RazorpayService razorpayService = mock(RazorpayService.class);

        PaymentController controller = new PaymentController(paymentService, resumeService, userService, razorpayService);

        String payload = "{\"payload\":{\"payment\":{\"entity\":{\"order_id\":\"ord_123\",\"id\":\"pay_456\"}}}}";
        when(razorpayService.verifyWebhookSignature(payload, "sig")).thenReturn(true);

        var response = controller.webhook(Map.of("X-Razorpay-Signature", "sig"), payload);
        assertEquals(200, response.getStatusCodeValue());

        verify(paymentService).markCompletedByProviderOrderId("ord_123", "pay_456");
    }
}

