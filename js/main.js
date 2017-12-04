(function()
{
    // find the height and width of the browser
    var browser_height = 0;
    var browser_width = 0;

    /*
        cross browser js polyfills
    */
    var cross_browser_funcs = new function()
    {
        /*
            return the inner width of the client
        */
        this.inner_width = function()
        {
            return window.innerWidth || document.documentElement.clientWidth || document.body.clientWidth;;
        };

        /*
            return the inner height of the client
        */
        this.inner_height = function()
        {
            return window.innerHeight || document.documentElement.clientHeight || document.body.clientHeight;
        };
        
        /*
            check to see if an element is in the view port
            this is just a partial (not full)

            find the first one that is partially in the viewport
            to accomplish this, we include the size of the dom in the calculation
            which does not force it to be completely within the window

            @param: element     => the element to check to see if it is visible
            @returns: bool      => true if element is at least partially visible
        */
        this.in_viewport = function(element)
        {
            // get the bounding rect, this shows the position
            // of the element as well as the size on the page
            var rect = element.getBoundingClientRect();

            return (
                rect.top >= 0 &&
                rect.left >= 0 &&
                rect.bottom <= (cross_browser_funcs.inner_height() + rect.height) &&
                rect.right <= (cross_browser_funcs.inner_width() + rect.width)
            );
        };

        // ** TODO **
        //  => Element.classList.add        (IE <10?)
        //  => Element.classList.remove     (IE <10?)
    };

    /*
        function to set the height of a section to the height of the browser
        this will ensure we don't have overlap between sections
        when we don't want there to be any
        @param: section             => the section to set the height of, HTMLElement
    */
    var set_section_height = function(section)
    {
        // make sure we have valid input
        if (section == null)
            return;

        // set the height of the section
        section.style.height = browser_height + 'px';
    };

    /*
        function to initialize the cover section of the page
        this is the main image, hero, and call to actions
    */
    var cover_section = function()
    {
        // select the cover
        var cover_dom = document.getElementById('cover');

        /*
            function to set the background image on the cover photo
            this is based on the width of the browser
        */
        var set_cover_photo_size = function()
        {
            // find the background container
            var container = document.getElementById('background_container');

            // make sure we have the container where we will set the css, else give up
            if (container == null)
                return;

            // initialize the images that we have
            var img_sizes = [];

            // initialize the mode the screen is in
            var screen_mode = '';

            // is this in portrait or landscape mode
            // for desktop screens, we will usually be in landscape
            // phones will usually be in portrait
            // check to see if the device has a greater width than height
            // and set the prefix for our cover image accordingly
            // as well as the image sizes
            if (browser_width >= browser_height)
            {
                // landscape
                screen_mode = 'l';

                // create the list of image sizes we have
                //  320 is the smallest and hard-coded
                //  therefore, it does not need to be part of this list
                //  if it is the biggest that is available, then we will
                //  already have it there
                img_sizes = [1920, 1366, 1024, 768, 480];
            }
            else
            {
                // portrait
                screen_mode = 'p';

                // set the image sizes
                img_sizes = [1080, 1024, 414, 375, 320];
            }

            // iterate on the image sizes in reverse
            for (var i = 0; i < img_sizes.length; i++)
            {
                // does this one fit? 
                // we want the biggest and baddest possible
                if (browser_width < img_sizes[i])
                    continue;

                // this will work
                // set the background on the cover
                container.style.backgroundImage = 'url(img/cover' + img_sizes[i] + screen_mode + '.png)';

                // we don't need to do this again, we found the best fit
                // break here
                break;
            }
        };

        // initialize the cover section
        set_section_height(cover_dom);

        // find the best image for the background
        set_cover_photo_size();        
    };
    
    /*
        function to initialize and handle the the summary section
    */
    var summary_section = function()
    {
        // select the summary section
        var summary_dom = document.getElementById('summary');

        // initialize the summary section height
        set_section_height(summary_dom);
    };

    /*
        function to initialize the contact section of the page
        this is a form that can be used to send a quick message
    */
    var contact_section = function()
    {
        // select the contact section
        var contact_dom = document.getElementById('contact');

        // attach handlers to the hidden iframe
        // this will handle our form submit
        var target_iframe = document.getElementById('hidden_iframe');

        /* 
            form submit handler, fires when the iframe has loaded

            handle submits of the contact form
            and change the UI to show the submission was accepted

            reads the global submitted var
            this is set by the head in the js global scope
            and when the submit button is clicked

        */
        var on_iframe_load = function()
        {
            // make sure that we aren't firing this for no reason
            // we will only want to change the ui if the form
            // was actually submitted
            if (!_submitted)
                return;

            // remove the handler, we won't have a situation
            // where this should fire twice
            // only one message per page load
            target_iframe.removeEventListener('load', on_iframe_load);

            // swap out the form with a thank you message
            // that will indicate to the user that we will
            // be in contact

            // find the contact section
            var contact_section = document.getElementById('contact');

            // make sure we have it
            if (contact_section == null)
                return;

            // set the submitted class
            // this will hide the form and show our thank you message
            contact_section.classList.add('submitted');
        };

        if (target_iframe != null)
            target_iframe.addEventListener('load', on_iframe_load);

        // initialize the contact section height
        set_section_height(contact_dom);
    };

    /*
        initialize the full page handlers
        this will have global handlers
    */
    var full_page_init = function()
    {
        // var to de-bounce our scrolling
        // and ensure we don't fire too often
        var scroll_animation_requested = false;

        // find the footer
        var footer = document.getElementById('footer');

        // find all sections
        // this will help us determine what color the footer should be
        var sections = document.getElementsByTagName('section');

        // set the globals for window size
        browser_height = cross_browser_funcs.inner_height();
        browser_width = cross_browser_funcs.inner_width();
        
        /*
            function to run when we have observed scrolling
            this will be de-bounced via request animation frame
            and will show/hide the footer when appropriate
        */
        var on_scroll = function()
        {
            // are we requesting an animation frame?
            // if so, we will handle this scroll event
            // when the animation frame is ready
            if (scroll_animation_requested)
                return;

            // set the flag, we are requesting now
            scroll_animation_requested = true;

            // we need to request a frame
            window.requestAnimationFrame(function()
            {
                // update the footer, if we need to
                // we will do this to start by checking the scrollY
                // and making sure that we have cleared the cover page
                if (window.scrollY >= 300)
                {
                    // we should show the footer (flexbox)
                    footer.style.display = 'flex';

                    // we have an issue, with our color scheme
                    // there really isn't a color that works well (besides black)
                    // for both the light gray and blue backgrounds
                    // so we will change out the color of the footer
                    // based on the section that it is covering

                    // iterate on the sections in reverse order
                    // starting from bottom to top
                    // and find the first one that is in the view port
                    for (var i = sections.length - 1; i >= 0; i--)
                    {
                        // check to see if this is in the viewport
                        // this would tell us that at least the bottom of the screen
                        // is displaying this section
                        if (!cross_browser_funcs.in_viewport(sections[i]))
                            continue;

                        // we are in the viewport
                        // set the color correctly

                        // build the correct class by reading the data tag on the element
                        var correct_class = 'on_' + sections[i].getAttribute('data-bg');

                        // check to see if we need to make the change
                        // if we have the right class, then we can quit here
                        if (footer.classList.contains(correct_class))
                            break;

                        // need to change the class
                        // not all browsers can take in two params
                        // so remove each possibility with a separate call
                        footer.classList.remove('on_blue');
                        footer.classList.remove('on_gray');
                        
                        // add the correct class
                        footer.classList.add(correct_class);
                    }
                }
                else
                {
                    // we should hide the footer
                    footer.style.display = 'none';
                }

                // reset the flag
                // if we scroll, we can request again
                scroll_animation_requested = false;
            });
        };

        // attach the scroll handler
        window.addEventListener('scroll', on_scroll);
    };

    /*
        function to initialize our page
    */
    var page_init = function()
    {
        // initialize all globals
        full_page_init();

        // begin the cover section
        cover_section();

        // begin summary section
        summary_section();

        // begin contact section
        contact_section();
    };

    // initialize
    page_init();

})();